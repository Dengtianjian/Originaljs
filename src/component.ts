import Element from "./element";

export function defineElement(
  name: string,
  constructor: CustomElementConstructor,
  options = {}
) {
  window.customElements.define(name, constructor, options);
}

export function createElement(props: string[] = []) {
  return class extends Element {
    static observedAttributes: string[] = props;
    _props = props;
    constructor() {
      super();
    }
  }
}

export function parserDom(template: string): Node[] | Node {
  const DP: DOMParser = new DOMParser();
  const document: Document = DP.parseFromString(template, "text/html");
  const headChildNodes: NodeListOf<ChildNode> =
    document.childNodes[0].childNodes[0].childNodes;
  const bodyChildNodes: NodeListOf<ChildNode> =
    document.childNodes[0].childNodes[1].childNodes;
  const nodes: Node[] = [
    ...Array.from(headChildNodes),
    ...Array.from(bodyChildNodes)
  ];
  return nodes;
}