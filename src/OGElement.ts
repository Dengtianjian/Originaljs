import { compareMerge } from "./Diff";
import { bindMethods } from "./Method";
import { parseDom } from "./Parser";
import { Reactive } from "./reactive";
import Transition from "./Transition";
import { IEl, IOGElement } from "./types/ElementType";
import { IRefTree } from "./types/Ref";
import { ICSSStyleDeclaration } from "./types/TransitionType";
import { setUpdateView } from "./View";

export class OGElement extends HTMLElement implements IOGElement {
  __og__: { reactive: Reactive; transitions: Record<string, Transition>; el: IEl; slots: Record<string, Node[]>; } = {
    reactive: null,
    transitions: {},
    el: null,
    slots: {}
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
    bindMethods(this.__og__.el, this, this);
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

      slotElItem.addEventListener("slotchange", () => {
        if (slotName === "default") {
          this.__og__.slots[slotName].push(...(this.__og__.el.querySelector("slot:not(name)") as HTMLSlotElement).assignedNodes());
        } else {
          this.__og__.slots[slotName].push(...(this.__og__.el.querySelector(`slot[name=${slotName}]`) as HTMLSlotElement).assignedNodes());
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
  };
  transition(transitionName: string, initStyles?: ICSSStyleDeclaration): Transition | undefined {
    let transition = this.__og__.transitions[transitionName];
    if (transition === undefined) throw new Error("Undefined transition element：" + transitionName);
    if (initStyles) transition.step(initStyles, 0);
    return transition;
  }
}