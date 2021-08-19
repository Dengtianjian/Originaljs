import { Reactive } from "../reactive";
import Transition from "../transition";
import { IRefTree } from "./Ref";
import { ICSSStyleDeclaration } from "./TransitionType";

export type TOGProperties = {
  [key: string]: any,
  reactive: Reactive,
  data: IOGElement
}

export type IEl = (HTMLElement | ShadowRoot | Element) & TOGProperties;

export interface IOGElement extends HTMLElement {
  __og__: {
    reactive: Reactive,
    transitions: Record<string, Transition>,
    el: IEl,
    slots: Record<string, Node[]>,
    refTree: IRefTree
  },
  connected(): void;
  rendered(): void;
  disconnected(): void;
  adopted(): void;
  propertyChanged(name: string, newValue: string, oldValue: string): void;
  render(): null | Node | NodeList | string;
  rerender(template: string | Node | NodeList): void;
  update(propertyName: string, newValue: any): void;
  setStatic(propertyName: string, isDeep: boolean): void;
  transition(transitionName: string, initStyle?: ICSSStyleDeclaration): Transition | undefined
}