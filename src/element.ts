import { IEl, IElement } from "./types/ElementType";

export class Element extends HTMLElement implements IElement {
  OGElement: boolean = true;
  props: string[] = [];
  el: IEl = null;
  slots: Record<string, HTMLElement[]> = {};
  constructor() {
    super();
    this.el = this.attachShadow({ mode: "closed" });
  }
  private connectedCallback(): void {
    this.connected();
    this.templateMount();
    this.collectSlots();
    // TODO 响应式
    this.rendered();
  }
  private disconnectedCallback(): void {
    this.disconnected();
  }
  private adoptedCallback(): void {
    this.adopted();
  }
  private attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    this.propChanged(name, newValue, oldValue);
  }
  private templateMount(): void {

  }
  private collectSlots(): void { }
  propChanged(name: string, newValue: string, oldValue: string): void { }
  connected(): void { };
  rendered(): void { };
  adopted(): void { }
  disconnected(): void { };
  update<T>(propertyName: string, newValue: T | any): void { }
  render(): null | Node | NodeList | string { return null; }
}