import Element from "./element";

export function defineElement(
  name: string,
  constructor: CustomElementConstructor,
  options = {}
) {
  window.customElements.define(name, constructor, options);
}

export function createElement(props: string[]) {
  return class extends Element {
    static observedAttributes: string[] = props;
    _props = props;
    constructor() {
      super();
    }
  }
}