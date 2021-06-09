export interface IElement {

}

export type IMethods = {
  selector?: string;
  options?: boolean | AddEventListenerOptions;
  type: keyof HTMLBodyElementEventMap;
  listener: (el: HTMLBodyElement, ev: MouseEvent) => any;
};

export type IMethodObject = {
  [name: string]: IMethods | ((el: HTMLElement) => void);
};

export type TPropValueFunction = (
  newV: string | boolean | number,
  oldV: string | boolean | number,
  name: string
) => void;

export type TProp = {
  selector?: string;
  attribute?: string;
  el?: HTMLElement | Element | ShadowRoot;
  value: string | boolean | number;
  observer?: TPropValueFunction;
};
export type TProps = {
  [key: string]: TProp | TPropValueFunction;
};
