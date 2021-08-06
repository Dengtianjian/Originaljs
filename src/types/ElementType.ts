import { Reactive } from "../reactive";
import Transition from "../Transition";
import { IRefTree } from "./Ref";
import { ICSSStyleDeclaration } from "./TransitionType";

export type TOGProperties = {
  [key: string]: any,
  reactive: Reactive,
  data: IOGElement
}

export type IEl = (HTMLElement | ShadowRoot | Element) & {
  __og__reactive?: Reactive,
  __og__tagCollected: boolean,
  __og__attrCollected: boolean,
  __og__propertiesPath: string
} & TOGProperties;

export interface IOGElement extends HTMLElement {
  __og__reactive: Reactive,
  __og__: {
    reactive: Reactive,
    transitions: Record<string, Transition>,
    el: IEl,
    slots: Record<string, Node[]>
  },
  // transitions: Record<string, Transition>,
  // el: IEl,
  // slots: Record<string, Node[]>;
  // refs: IRefTree,
  connected(): void;
  rendered(): void;
  disconnected(): void;
  adopted(): void;
  propChanged(name: string, newValue: string, oldValue: string): void;
  render(): null | Node | NodeList | string;
  update(propertyName: string, newValue: any): void;
  transition(transitionName: string, initStyle?: ICSSStyleDeclaration): Transition | undefined
}