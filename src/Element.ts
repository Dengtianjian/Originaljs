import CustomElement from "./CustomElement";

function createElement(props: string[] = []) {
  return class extends CustomElement {
    static observedAttributes: string[] = props;
    constructor() {
      super(props);
    }
  }
}

function defineElement(name: string, constructor: CustomElementConstructor, options: ElementDefinitionOptions = {}): void {
  window.customElements.define(name, constructor, options);
}

export default {
  createElement,
  defineElement
}