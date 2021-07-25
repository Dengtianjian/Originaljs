import { Reactive } from "../reactive";
import Transition from "../Transition";
import { IRefTree } from "./Ref";

export type IEl = (HTMLElement | ShadowRoot | Element) & {
  __og__reactive?: Reactive,
  __og__tagCollected: boolean,
  __og__attrCollected: boolean,
  __og__propertiesPath: string
};

export interface IOGElement extends HTMLElement {
  __og__reactive: Reactive,
  transitions: Record<string, Transition>,
  OGElement: boolean;
  el: IEl,
  slots: Record<string, Node[]>;
  refs: IRefTree,
  connected(): void;
  rendered(): void;
  disconnected(): void;
  adopted(): void;
  propChanged(name: string, newValue: string, oldValue: string): void;
  render(): null | Node | NodeList | string;
  update(propertyName: string, newValue: any): void;
  transition(transitionName: string): Transition | undefined
}