import Transition from "./Transition";
import { ICustomElement, IElement } from "./Typings/CustomElementTypings";
import { TCSSStyleDeclaration } from "./Typings/TransitionTypings";
import Parser from "./Reactive/Parser";
import Reactive from "./Reactive";

export default class CustomElement extends HTMLElement implements ICustomElement {
  constructor(props: string[] = []) {
    super();
    this.__OG__.props = props;
    this.__OG__.el = this.attachShadow({
      mode: "closed"
    });
  }
  __OG__ = {
    reactive: null,
    rootEl: null,
    refTree: {},
    transitions: {},
    el: null,
    slots: {},
    props: []
  };
  private connctedCallback(): void {
    this.connected();
  }
  private disconnectedCallback(): void {
    this.disconnected();
  }
  private adoptedCallback(): void {
    this.adopted();
  }
  private attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    this.propertyChanged(name, newValue, oldValue);
  }
  private collectSlots(): void {
    const slotEls: NodeListOf<HTMLSlotElement> = this.__OG__.el.querySelectorAll("slot");

    slotEls.forEach(slotElItem => {
      const slotName: string = slotElItem.name || "default";

      if (!this.__OG__.slots[slotName]) {
        this.__OG__.slots[slotName] = [];
      }

      slotElItem.addEventListener("slotchange", () => {
        this.__OG__.slots[slotName].push(...slotElItem.assignedNodes());
        this.__OG__.slots[slotName] = Array.from(new Set(this.__OG__.slots[slotName]));
      });
    })
  }
  render(template: string | Element | NodeList | Node[]): Promise<boolean> {
    this.__OG__.el.innerHTML = "";
    this.__OG__.slots = {};
    this.__OG__.el.append(...Parser.parseTemplate(template));
    Reactive.observe(this.__OG__.el, this);

    this.collectSlots();

    this.rendered();
    return Promise.resolve(true);
  }
  connected(): void {

  }
  disconnected(): void {

  }
  adopted(): void {

  }
  rendered(): void {

  }
  propertyChanged(name: string, newValue: unknown, oldValue: unknown): void {

  }
  updateProperty(propertyName: string, newValue: any): void {

  }
  revokeObserve(target: string | IElement, isDeep: boolean): void {

  }
  transition(transitionName: string, initStyles?: TCSSStyleDeclaration): Transition {
    return {}
  }
  useTransitionPreset(presetName: string): Transition {
    return {};
  }
}