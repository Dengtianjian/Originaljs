import { IElement } from "../types/elementType";

namespace ElementSpace {
  export class Element extends HTMLElement implements IElement {
    $ref: Element | ShadowRoot | null = null;
    _state: Record<string, { value: any; els: Set<HTMLElement> }> = {};
    $methods: Record<string, { listener: any; els: Array<HTMLElement> }> = {};
    _template: Node | NodeList | string = "";
    static observedAttributes: string[] = [];
    constructor(template) {
      super();
      this.$ref = this.attachShadow({ mode: "closed" });
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
    connected() {}
    disconnected() {}
    adoptied() {}
    propChanged(name: string, oldV: string, newV: string) {}
    private attributeChangedCallback(name: string, oldV: string, newV: string) {
      this.propChanged(name, newV, oldV);
    }
    render(): null | Node | NodeList | string {
      return null;
    }
    protected _render(): void {
      if (this._template === "" && this.render() !== null) {
        this._template = this.render();
      }

      let appendNodes: Node[] | NodeList = [];
      if (typeof this._template === "string") {
        const document: Document = new DOMParser().parseFromString(
          this._template,
          "text/html"
        );
        const headChildNodes: NodeListOf<ChildNode> =
          document.childNodes[0].childNodes[0].childNodes;
        const bodyChildNodes: NodeListOf<ChildNode> =
          document.childNodes[0].childNodes[1].childNodes;
        appendNodes.push(
          ...Array.from(headChildNodes),
          ...Array.from(bodyChildNodes)
        );
      } else {
        if (this._template instanceof NodeList) {
          appendNodes = appendNodes;
        } else {
          appendNodes = [this._template];
        }
      }

      for (const nodeItem of appendNodes) {
        this._reactive(nodeItem as HTMLElement);
        this._bindMethods(nodeItem as HTMLElement);
      }

      this.$ref.append(...appendNodes);
    }
    _reactive(El: HTMLElement): boolean {
      if (El.childNodes.length > 0) {
        El.childNodes.forEach((node) => {
          this._reactive(node as HTMLElement);
        });
      }
      let ElHTML: string = "";
      switch (El.nodeType) {
        case 3:
          ElHTML = El.textContent;
          break;
        default:
          ElHTML = El.innerHTML;
          break;
      }
      const vars: null | string[] = ElHTML.match(/(?<=\{).+?(?=\})/g);
      if (vars === null) {
        return true;
      }

      vars.forEach((varItem) => {
        ElHTML = ElHTML.replace(`\{${varItem}\}`, this[varItem].toString());
        if (!this._state[varItem]) {
          this._state[varItem] = {
            value: this[varItem],
            els: new Set<HTMLElement>(),
          };
        }
        this._state[varItem].els.add(El);
      });

      switch (El.nodeType) {
        case 3:
          El.textContent = ElHTML;
          break;
        default:
          El.innerHTML = ElHTML;
          break;
      }
      return true;
    }
    _bindMethods(El: HTMLElement): boolean {
      if (El.childNodes.length > 0) {
        El.childNodes.forEach((node) => {
          this._bindMethods(node as HTMLElement);
        });
      }
      if (El.attributes && El.attributes.length > 0) {
        Array.from(El.attributes).forEach((attrItem) => {
          if (
            /^on[a-z]+$/.test(attrItem.name) &&
            /^\w+(\(\))?/.test(attrItem.value)
          ) {
            const paramsRaw: RegExpMatchArray = String(attrItem.value).match(
              /(?<=\().+(?=\))/
            );
            let params = [];
            if (paramsRaw !== null) {
              params = paramsRaw[0].split(",");
            }
            const methodName: RegExpMatchArray = String(attrItem.value).match(
              /\w+(?=\(.+\))?/
            );
            //* 清除DOMParser 加上的方法
            El[attrItem["localName"]] = null;
            // TODO 绑定多个方法
            // El.addEventListener(
            //   eventName[0],
            //   this[methodName[0]].bind(this, ...params)
            // );

            if (paramsRaw && params.length > 0) {
              params.forEach((param, index) => {
                if (/\$target/.test(param)) {
                  params[index] = El;
                }
              });
            }
            if (paramsRaw) {
              El[attrItem["localName"]] = this[methodName[0]].bind(
                this,
                ...params
              );
            } else {
              El[attrItem["localName"]] = this[methodName[0]].bind(this);
            }
          }
        });
      }

      return true;
    }
    setState(key, value) {
      const state = this._state[key];
      state.els.forEach((el) => {
        if (el.nodeType === 3) {
          el.textContent = el.textContent.replace(
            state.value.toString(),
            value
          );
        } else {
          el.innerHTML = el.innerHTML.replace(state.value.toString(), value);
        }
      });
      state.value = value;
    }
    update(key, value) {}
  }
}

export default ElementSpace;
