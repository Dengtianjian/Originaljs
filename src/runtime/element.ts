import { IOGElement, TMethodItem, TStateItem } from "../types/elementType";
import { parserDom } from "./component";
import Reactive from "./reactive";
import Diff from "./reactive/diff";
import { updateRef, updateTargetView } from "./reactive/view";

export default class Element extends HTMLElement implements IOGElement {
  _customElement: boolean = true;
  $ref: Element | ShadowRoot | null = null;
  _slots: Record<string, HTMLElement[]> = {};
  _state: Record<string, TStateItem> = {};
  _methods: Record<
    string,
    TMethodItem
  > = {};
  _props: Record<string, any> = {};
  static observedAttributes: string[] = [];
  constructor() {
    super();
    this.$ref = this.attachShadow({ mode: "closed" });
  }
  connectedCallback() {
    this.connected();
    this._render();
    this._collectionSlots();
    Reactive.observer(this.$ref, this);
    this.rendered();
  }
  disconnectedCallback() {
    this.disconnected();
  }
  adoptedCallback() {
    this.adoptied();
  }
  connected() { }
  rendered() { }
  disconnected() { }
  adoptied() { }
  propChanged(name: string, newV: string, oldV: string) { }
  attributeChangedCallback(name: string, oldV: string, newV: string) {
    this.propChanged(name, newV, oldV);
  }
  render(): null | Node | NodeList | string {
    return null;
  }
  _render(): void {
    const template: string | Node | NodeList = this.render();

    let appendNodes: Node[] | NodeList = [];
    if (typeof template === "string") {
      appendNodes = parserDom(template) as Node[];
    } else if (!(template instanceof NodeList)) {
      appendNodes = [template];
    }

    for (const nodeItem of appendNodes) {
      this._bindMethods(nodeItem as HTMLElement);
    }

    this.$ref.append(...appendNodes);
  }
  _bindMethods(El: HTMLElement): boolean {
    if (El.childNodes.length > 0) {
      El.childNodes.forEach((node) => {
        this._bindMethods(node as HTMLElement);
      });
    }
    if (El.attributes && El.attributes.length > 0) {
      Array.from(El.attributes).forEach((attrItem) => {
        if (
          /^on[a-z]+$/.test(attrItem.name) &&
          /^\w+(\(\))?/.test(attrItem.value)
        ) {
          const methodName: RegExpMatchArray = String(attrItem.value).match(
            /\w+(\(.+\))?;?/g
          );
          //* 清除DOMParser 加上的方法
          El[attrItem["localName"]] = null;

          for (const name of methodName) {
            const params = this._parserParams(name);
            const methodNameItem: RegExpMatchArray =
              name.match(/\w+(?=\(.+\))?/);
            if (methodNameItem === null) {
              continue;
            }

            const listener = this[methodNameItem[0]].bind(this, ...params);
            let type: RegExpMatchArray =
              attrItem.localName.match(/(?<=on)\w+/g);
            if (type === null) {
              continue;
            }
            if (!this._methods[methodNameItem[0]]) {
              this._methods[methodNameItem[0]] = [];
            }
            this._methods[methodNameItem[0]].push({
              el: El,
              type: type[0] as keyof WindowEventMap,
              listener,
              params
            });
            El.addEventListener(
              type[0] as keyof WindowEventMap,
              listener
            );
          }
          El.removeAttribute(attrItem["localName"]);
        }
      });
    }

    return true;
  }
  _parserParams(paramsString: string): string[] {
    const paramsRaw: RegExpMatchArray =
      String(paramsString).match(/(?<=\().+(?=\))/);
    if (paramsRaw === null) {
      return [];
    }
    let params = [];
    if (paramsRaw !== null) {
      params = paramsRaw[0].split(",");
    }
    return params;
  }
  async setMethod(name: string, func: Function | AsyncGeneratorFunction, params: any[] = []) {
    const els = this._methods[name];
    els.forEach(elItem => {
      const listener = func.bind(this, ...params);
      elItem.el.removeEventListener(elItem.type, elItem.listener);
      elItem.el.addEventListener(elItem.type, listener);
      elItem.listener = listener;
      elItem.params = params;
    })
  }
  _collectionSlots() {
    const slots = this.$ref.querySelectorAll("slot");

    for (const slot of Array.from(slots)) {
      const slotName: string = slot.name || "default";
      if (!this._slots[slotName]) {
        this._slots[slotName] = [];
      }
      slot.addEventListener("slotchange", () => {
        if (slotName === "default") {
          // @ts-ignore
          this._slots[slotName].push(...this.$ref.querySelector("slot:not(name)").assignedNodes());
        } else {
          // @ts-ignore
          this._slots[slotName].push(...this.$ref.querySelector("slot[name='" + slotName + "']").assignedNodes());
        }
      })
    }
  }
  update(attributeName: string, value: any): void {
    if (typeof value === "object") {
      Diff.compareMerge(value, this[attributeName]);
    } else {
      this[attributeName] = value;
      const refTree = this.$ref.__og__.refs;
      updateRef(refTree[attributeName], this[attributeName], this);
    }
  }
}