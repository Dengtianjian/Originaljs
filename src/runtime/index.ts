export { default as Element } from "./element";
export { ObserverNode, ObserverNodeAttributes } from "./mutationObserver";

export function Query(selectors, rooEl = null) {
  if (rooEl) {
    return rooEl.querySelector(selectors);
  }
  return document.querySelector(selectors);
}

export function defineComponent(
  name: string,
  constructor: CustomElementConstructor,
  options = {}
) {
  window.customElements.define(name, constructor, options);
}

export async function importTemplate(filePath: string): Promise<string> {
  const template: {
    default: string;
  } = await import(filePath);
  return template.default;
}

// function mount(selector){
//   document.querySelector(selector).innser
// }

export default {
  Query,
  importTemplate,
  defineComponent,
};
