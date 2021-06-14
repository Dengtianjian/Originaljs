import { Element } from "../runtime";

export type TMethodItem = Array<{
  el: HTMLElement;
  type: keyof WindowEventMap;
  params: any[];
  listener: () => any
}>;
export type TStateItem = { value: any; els: Set<{ el?: HTMLElement | Text, attribute?: Attr, type: keyof IStateTypeMap }> };

export interface IStateTypeMap {
  "attribute": 1, "element": 2
};
export interface IElement extends HTMLElement {
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
  setState<T>(key: string, value: T): void
  setMethod(name: string, func: Function | AsyncGeneratorFunction): void
}