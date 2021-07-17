import { Reactive } from "../reactive";
import { IRefTree } from "./Ref";

export type IEl = (HTMLElement | ShadowRoot | Element) & {
  __og__?: Reactive
};

export interface IOGElement extends HTMLElement {
  OGElement: boolean;
  props: string[];
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
}