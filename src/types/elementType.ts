export type IEl = ShadowRoot | HTMLElement;

export interface IElement {
  OGElement: boolean;
  props: string[];
  el: IEl,
  slots: Record<string, HTMLElement[]>;
  connected(): void;
  rendered(): void;
  disconnected(): void;
  adopted(): void;
  propChanged(name: string, newValue: string, oldValue: string): void;
  render(): null | Node | NodeList | string;
  update(propertyName: string, newValue: any): void;
}