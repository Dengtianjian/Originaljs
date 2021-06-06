export function defineComponent(
  name: string,
  constructor: CustomElementConstructor,
  options = {}
) {
  window.customElements.define(name, constructor, options);
}
