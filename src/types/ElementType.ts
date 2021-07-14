import { IRefTree } from "./Ref";

export type IEl = IOGElement;

export interface IOGElement extends HTMLElement {
  __og__: any;
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