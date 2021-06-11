import { Element } from "../runtime";

export type TMethodItem = {
  listener: any;
  params: any[];
  els: Array<{
    el: HTMLElement;
    type: keyof WindowEventMap;
  }>;
}

export interface IElement extends HTMLElement {
  _customElement: boolean;
  $ref: Element | ShadowRoot | null;
  _state: Record<string, { value: any; els: Set<HTMLElement> }>;
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

