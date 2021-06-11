import Element from "./element";

export function defineElement(
  name: string,
  constructor: CustomElementConstructor,
  options = {}
) {
  window.customElements.define(name, constructor, options);
}

export function createElement(props: Record<string, string> = {}) {
  return class extends Element {
    static observedAttributes: string[] = Object.keys(props);
    _props = props;
    constructor() {
      super();
    }
  }
}