import { Element, Reactive } from "../runtime";

export interface IElement extends HTMLElement {
  __og_isCollected: boolean,
  __og__: Reactive
}

export type TMethodItem = Array<{
  el: HTMLElement;
  type: keyof WindowEventMap;
  params: any[];
  listener: () => any
}>;
export type TStateItem = { value: any; els: Set<{ el?: HTMLElement | Text, attribute?: Attr, type: keyof IStateTypeMap, template?: HTMLElement }> };

export interface IStateTypeMap {
  "attribute": 1, "element": 2, "for": 3
};
export interface IOGElement extends HTMLElement {
  _customElement: boolean;
  $ref: Element | ShadowRoot | null;
  _state: Record<string, TStateItem>;
  _methods: Record<
    string,
    TMethodItem
  >;
  _props: Record<string, any>
  connected(): void
  disconnected(): void
  adoptied(): void
  propChanged(name: string, newV: string, oldV: string): void
  render(): null | Node | NodeList | string;
  // setState<T>(key: string, value: T): void
  setMethod(name: string, func: Function | AsyncGeneratorFunction): void
  update(attributeName: string, value: any): void
}