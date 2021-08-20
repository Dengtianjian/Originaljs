import { compareMerge, compareObject } from "./Diff";
import { revokeByRefTree } from "./OGProxy";
import { parseDom, propertyNamesToPath, transformPropertyName } from "./Parser";
import { getPropertyData } from "./Property";
import { Reactive } from "./reactive";
import Transition from "./transition";
import { IEl, IOGElement } from "./types/ElementType";
import { IRefTree } from "./types/Ref";
import { ICSSStyleDeclaration } from "./types/TransitionType";
import Utils, { deepSetObjectPropertyValue } from "./Utils";
import { removeTargetRefTree, setUpdateView, updateRef } from "./View";

export class OGElement extends HTMLElement implements IOGElement {
  __og__: {
    reactive: Reactive; transitions: Record<string, Transition>; el: IEl; slots: Record<string, Node[]>;
    refTree: IRefTree; props: string[]
  } = {
      reactive: null,
      transitions: {},
      el: null,
      slots: {},
      refTree: {},
      props: []
    };
  constructor(props: string[]) {
    super();
    this.__og__.props = props;
    // @ts-ignore
    this.__og__.el = this.attachShadow({ mode: "closed" });
  }
  private connectedCallback(): void {
    this.connected();
    this.templateMount();
    this.collectSlots();
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
    this.propertyChanged(name, newValue, oldValue);
  }
  private templateMount(template: string | Node | Node[] | NodeList = this.render()): void {
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
  propertyChanged(name: string, newValue: string, oldValue: string): void { }
  connected(): void { };
  render(): null | Node | NodeList | string { return null; }
  rendered(): void { };
  adopted(): void { }
  disconnected(): void { };
  rerender(template: string | Node | NodeList): Promise<boolean> {
    console.log(revokeByRefTree(this.__og__.refTree, this));
    this.__og__.el.innerHTML = "";
    this.templateMount(template);
    this.collectSlots();
    Reactive.observe(this.__og__.el, this);
    this.rendered();
    return Promise.resolve(true);
  };
  update<T>(propertyName: string, newValue: T | any): void {
    let propertyNames: string[] = transformPropertyName(propertyName);
    let oldValue: any = getPropertyData(propertyNames, this);
    let oldValueCopy: any = Utils.deepCopy(oldValue);

    if (typeof newValue === "object" && newValue !== null && newValue !== undefined && typeof oldValue === "object") {
      let compartResult: boolean = compareObject(newValue, oldValue);
      compareMerge(newValue, oldValue);

      if (compartResult === false && oldValue.__og__) {
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
    this.propertyChanged(propertyName, newValue, oldValueCopy);
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