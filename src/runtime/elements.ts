import { IElement } from "../types/elementType";

namespace ElementSpace {
  export class Element extends HTMLElement implements IElement {
    $ref: Element | ShadowRoot | null = null;
    $state: Record<string, { value: any, els: Element[] }> = {};
    state: Record<string, any> = {};
    $methods: Record<string, { listener: any, els: Element[] }> = {};
    _template: Node | NodeList | string = "";
    static observedAttributes: string[] = [];
    constructor(template) {
      super();
      this._template = template;
    }
    private connectedCallback() {
      this._render();
      this.connected();
    }
    private disconnectedCallback() {
      this.disconnected();
    }
    private adoptedCallback() {
      this.adoptied();
    }
    connected() {

    }
    disconnected() { }
    adoptied() { }
    propChanged(name: string, oldV: string, newV: string) { }
    private attributeChangedCallback(name: string, oldV: string, newV: string) {
      this.propChanged(name, newV, oldV);
    }
    protected _render(): void {
      if (this._template === "" && this.render() !== null) {
        this._template = this.render();
      }

      let appendNodes: Node[] | NodeList = [];
      if (typeof this._template === "string") {
        const document: Document = new DOMParser().parseFromString(this._template, "text/html");
        const headChildNodes: NodeListOf<ChildNode> = document.childNodes[0].childNodes[0].childNodes;
        const bodyChildNodes: NodeListOf<ChildNode> = document.childNodes[0].childNodes[1].childNodes;
        appendNodes.push(...Array.from(headChildNodes), ...Array.from(bodyChildNodes));
      } else {
        if (this._template instanceof NodeList) {
          appendNodes = appendNodes;
        } else {
          appendNodes = [this._template];
        }
      }

      for (const nodeItem of appendNodes) {
        this._reactive(nodeItem as HTMLElement);
      }
      this.append(...appendNodes);
    }
    render(): null | Node | NodeList | string {
      return null;
    }
    _reactive(El: HTMLElement): boolean {
      let ElText: string = "";
      switch (El.nodeType) {
        case 3:
          ElText = El.textContent;
          break;
        default:
          ElText = El.innerText;
          break;
      }
      const vars: null | string[] = ElText.match(/(?<=\{).+?(?=\})/g);
      if (vars === null) {
        return true;
      }

      vars.forEach(varItem => {
        ElText = ElText.replace(`\{${varItem}\}`, this.state[varItem].toString());
      });
      switch (El.nodeType) {
        case 3:
          El.textContent = ElText;
          break;
        default:
          El.innerText = ElText;
          break;
      }
    }
  }
}

export default ElementSpace;