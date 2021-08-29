import Reactive from "../Reactive";
import Transition from "../Transition";
import { TRefTree } from "./RefTreeTypings";
import { TCSSStyleDeclaration } from "./TransitionTypings";

export type TOG = {
  [key: string]: any,
  reactive: Reactive,
  rootEl: IElement,
  refTree: TRefTree
}

export interface ICustomElement extends HTMLElement {
  __OG__: {
    transitions: Record<string, Transition>,
    el: IElement,
    slots: Record<string, Node[]>,
    props: string[]
  } & TOG
  connected(): void;
  disconnected(): void;
  adopted(): void;
  rendered(): void;
  propertyChanged(name: string, newValue: unknown, oldValue: unknown): void;
  render(template: string | Node | NodeList | Node[]): Promise<boolean>;
  updateProperty(propertyName: string, newValue: any): void;
  revokeObserve(target: string | IElement, isDeep: boolean): void;
  transition(transitionName: string, initStyles?: TCSSStyleDeclaration): Transition | undefined;
  useTransitionPreset(presetName: string): Transition
}

export interface IElement extends Element {
  __OG__: TOG
}