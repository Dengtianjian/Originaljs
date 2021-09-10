import Transition from "./Transition";
import { ICustomElement, IElement, TElement, TOG } from "./Typings/CustomElementTypings";
import { TCSSStyleDeclaration, TPreset, TTransitionItem } from "./Typings/TransitionTypings";
import Parser from "./Reactive/Parser";
import Reactive from "./Reactive";

export default class CustomElement extends HTMLElement implements ICustomElement {
  constructor(props: string[] = []) {
    super();
    this.__OG__.props = props;
    this.__OG__.el = this.attachShadow({
      mode: "closed"
    }) as unknown as ICustomElement;
  }
  __OG__ = {
    reactive: null,
    rootEl: null,
    refTree: {},
    transitions: {},
    el: null,
    slots: {},
    props: []
  } as {
    transitions: Record<string, Transition>;
    el: IElement;
    slots: Record<string, Node[]>;
    props: string[];
  } & TOG;
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
    Reactive.observe(this.__OG__.el as TElement, this as unknown as ICustomElement);

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
    console.log(propertyName, newValue);

  }
  revokeObserve(target: string | IElement, isDeep: boolean): void {

  }
  transition(transitionName: string, elKey?: string): Transition {
    const transition: Transition = this.__OG__.transitions[transitionName];
    if (transition === undefined) {
      throw new Error("Undefined transition element：" + transitionName);
    }
    transition.elKey = elKey;
    return transition;
  }
  useTransitionPreset(presetName: string, elKey?: string): Transition {
    const preset: TPreset = Transition.getPreset(presetName)
    if (preset === undefined) {
      throw new Error("Transition preset does not exist");
    }

    let transition: Transition = this.transition(presetName, elKey);
    preset.transitions.forEach(transitionItem => {
      transition.step(transitionItem.styles, transitionItem.callBack);
    });

    return transition;
  }
}