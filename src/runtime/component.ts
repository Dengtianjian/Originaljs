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

export function DOMFor(templateEl: string | Node, data: any, callback?: (node: Node, item: any, index?: number, key?: any) => Node | void): void {
  let el: Node;
  if (typeof templateEl === "string") {
    el = parserDom(templateEl) as Node;
  } else {
    el = templateEl;
  }
  if (data === null) {
    return;
  }

  Object.defineProperty(data, "_for", {
    configurable: false,
    value: () => {
      console.log(1);
    },
    enumerable: false,
    writable: false
  })
  console.log(data);


  const parentNode: Node & ParentNode = el.parentNode;
  if (typeof data[Symbol.iterator] === "undefined") {
    if (typeof data[Symbol.iterator] === "undefined" && Object.prototype.toString.call(data) !== "[object Object]") {
      return;
    }
  }
  const doms = [];
  if (Object.prototype.toString.call(data) === "[object Object]") {
    let forIndex: number = 0;
    for (const dataKey in data) {
      if (Object.prototype.hasOwnProperty.call(data, dataKey)) {
        const dataItem = data[dataKey];

      }
      forIndex++;
    }
  } else {
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      const newEl = el.cloneNode(true);
      newEl.innerText = data[index];
      doms.push(newEl);
    }
  }
  // parentNode.removeChild(el);
  parentNode.append(...doms);
  console.log(parentNode);


}