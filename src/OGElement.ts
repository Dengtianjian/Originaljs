import { compareMerge } from "./Diff";
import { bindMethods } from "./Method";
import { parseDom } from "./Parser";
import { Reactive } from "./reactive";
import { IEl, IOGElement } from "./types/ElementType";
import { IRefTree } from "./types/Ref";
import { setUpdateView, updateRef } from "./View";

export class OGElement extends HTMLElement implements IOGElement {
  __og__reactive: Reactive = null;
  OGElement: boolean = true;
  el: IEl = null;
  slots: Record<string, Node[]> = {};
  refs: IRefTree = {};
  constructor() {
    super();
    // @ts-ignore
    this.el = this.attachShadow({ mode: "closed" });
  }
  private connectedCallback(): void {
    this.connected();
    this.templateMount();
    this.collectSlots();
    bindMethods(this.el, this, this);
    this.__og__reactive = Reactive.observe(this.el, this);
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

    this.el.append(...template);
  }
  private collectSlots(): void {
    const slotEls: NodeListOf<HTMLSlotElement> = this.el.querySelectorAll("slot");

    for (const slotElItem of Array.from(slotEls)) {
      const slotName: string = slotElItem.name || "default";

      if (!this.slots[slotName]) {
        this.slots[slotName] = []
      };

      slotElItem.addEventListener("slotchange", () => {
        if (slotName === "default") {
          this.slots[slotName].push(...(this.el.querySelector("slot:not(name)") as HTMLSlotElement).assignedNodes());
        } else {
          this.slots[slotName].push(...(this.el.querySelector(`slot[name=${slotName}]`) as HTMLSlotElement).assignedNodes());
        }
      })
    }
  }
  propChanged(name: string, newValue: string, oldValue: string): void { }
  connected(): void { };
  render(): null | Node | NodeList | string { return null; }
  rendered(): void { };
  adopted(): void { }
  disconnected(): void { };
  update<T>(propertyName: string, newValue: T | any): void {
    if (typeof newValue === "object" && newValue !== null && newValue !== undefined) {
      compareMerge(newValue, this[propertyName]);
    } else {
      setUpdateView(this, propertyName, newValue, this);
    }
  }
}