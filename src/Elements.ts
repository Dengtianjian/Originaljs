import { OGElement } from "./OGElement";

export function createElement(props: string[] = []) {
  return class extends OGElement {
    static observedAttributes: string[] = props;
    constructor() {
      super();
    }
  }
}


export function defineElement(name: string, constructor: CustomElementConstructor, options: ElementDefinitionOptions = {}): void {
  window.customElements.define(name, constructor, options);
}

export default {
  createElement,
  defineElement
}