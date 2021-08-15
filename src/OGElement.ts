import { compareMerge, compareObject } from "./Diff";
import { bindMethods } from "./Method";
import { parseDom, propertyNamesToPath, transformPropertyName } from "./Parser";
import { getPropertyData } from "./Property";
import { Reactive } from "./reactive";
import Transition from "./transition";
import { IEl, IOGElement } from "./types/ElementType";
import { IRefTree } from "./types/Ref";
import { ICSSStyleDeclaration } from "./types/TransitionType";
import { deepSetObjectPropertyValue } from "./Utils";
import { removeTargetRefTree, setUpdateView, updateRef } from "./View";

export class OGElement extends HTMLElement implements IOGElement {
  __og__: {
    reactive: Reactive; transitions: Record<string, Transition>; el: IEl; slots: Record<string, Node[]>;
    refTree: IRefTree;
  } = {
      reactive: null,
      transitions: {},
      el: null,
      slots: {},
      refTree: {}
    };
  // transitions: Record<string, Transition> = {};
  constructor() {
    super();
    // @ts-ignore
    // this.el = this.attachShadow({ mode: "closed" });
    this.__og__.el = this.attachShadow({ mode: "closed" });
  }
  private connectedCallback(): void {
    this.connected();
    this.templateMount();
    this.collectSlots();
    // bindMethods(this.__og__.el, this, this);
    Reactive.observe(this.__og__.el, this);
    this.rendered();
  }
  private disconnectedCallback(): void {
    this.disconnected();
  }
  private adoptedCallback(): void {
    this.adopted();
  }
  private attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    this.propChanged(name, newValue, oldValue);
  }
  private templateMount(): void {
    let template: string | Node | Node[] | NodeList = this.render();

    if (template === null) return;

    if (typeof template === "string") {
      template = parseDom(template);
    } else if (template instanceof Node) {
      template = [template];
    } else if (template instanceof NodeList) {
      template = Array.from(template);
    }

    this.__og__.el.append(...template);
  }
  private collectSlots(): void {
    const slotEls: NodeListOf<HTMLSlotElement> = this.__og__.el.querySelectorAll("slot");

    for (const slotElItem of Array.from(slotEls)) {
      const slotName: string = slotElItem.name || "default";

      if (!this.__og__.slots[slotName]) {
        this.__og__.slots[slotName] = []
      };

      // slotElItem.addEventListener("slotchange", () => {
      //   if (slotName === "default") {
      //     this.__og__.slots[slotName].push(...(this.__og__.el.querySelector("slot:not(name)") as HTMLSlotElement).assignedNodes());
      //   } else {
      //     this.__og__.slots[slotName].push(...(this.__og__.el.querySelector(`slot[name=${slotName}]`) as HTMLSlotElement).assignedNodes());
      //   }
      // })
    }
  }
  propChanged(name: string, newValue: string, oldValue: string): void { }
  connected(): void { };
  render(): null | Node | NodeList | string { return null; }
  rendered(): void { };
  adopted(): void { }
  disconnected(): void { };
  update<T>(propertyName: string, newValue: T | any): void {
    let propertyNames: string[] = transformPropertyName(propertyName);
    let oldValue: any = getPropertyData(propertyNames, this);

    if (typeof newValue === "object" && newValue !== null && newValue !== undefined) {
      let compartResult: boolean = compareObject(newValue, oldValue);
      compareMerge(newValue, oldValue);

      if (compartResult === false) {
        updateRef(getPropertyData(propertyNames, oldValue.__og__.refTree), this, propertyNamesToPath(propertyNames));
      }

    } else if (newValue !== oldValue) {
      let target: unknown = this;
      deepSetObjectPropertyValue(this, [...propertyNames], newValue);
      if (propertyNames.length > 1) {
        propertyName = propertyNames.pop();
        target = getPropertyData(propertyNames, this);
      }

      setUpdateView(target, propertyName, newValue, this);
    }
  };
  transition(transitionName: string, initStyles?: ICSSStyleDeclaration): Transition | undefined {
    let transition = this.__og__.transitions[transitionName];
    if (transition === undefined) throw new Error("Undefined transition element：" + transitionName);
    if (initStyles) transition.step(initStyles, 0);
    return transition;
  };
  useTransitionPreset(presetName: string): Transition {
    let preset = Transition.getPreset(presetName);
    if (preset === undefined) {
      console.error("transition preset not exist");
      return;
    }
    let transition = this.transition(presetName, preset.initStyle);
    if (transition === undefined) {
      console.error("Undefined transition element：" + presetName);
      return;
    }
    preset.transitions.forEach(transitionItem => {
      transition.step(transitionItem.styles, transitionItem.duration, transitionItem.timingFunction, transitionItem.delay, transitionItem.callBack);
    });
    return transition;
  }
  setStatic(target: string | HTMLElement | Element, isDeep: boolean = false): void {
    if (typeof target === "string") {
      let refTree: IRefTree = getPropertyData(target, this.__og__.reactive.refTree);
      for (const key in refTree) {
        refTree[key] = [];
      }
    } else {
      removeTargetRefTree(target, isDeep);
    }
  }
}