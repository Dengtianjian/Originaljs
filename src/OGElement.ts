import { bindMethods } from "./Method";
import { parseDom } from "./Parser";
import { Reactive } from "./reactive";
import { IEl, IOGElement } from "./types/ElementType";

export class OGElement extends HTMLElement implements IOGElement {
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
    bindMethods(this.el, this);
    Reactive.observer(this.el, this);
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
    let template: string | Node | Node[] | NodeList = this.render();
    if (template === null) return;

    if (typeof template === "string") {
      template = parseDom(template);
    } else if (template instanceof Node) {
      template = [template];
    } else if (template instanceof NodeList) {
      template = Array.from(template);
    }

    this.el.append(...template);
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