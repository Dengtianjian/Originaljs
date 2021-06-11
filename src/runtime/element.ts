import { IElement } from "../types/elementType";

export default class Element extends HTMLElement implements IElement {
  $ref: Element | ShadowRoot | null = null;
  _state: Record<string, { value: any; els: Set<HTMLElement> }> = {};
  _methods: Record<
    string,
    {
      listener: any;
      params: any[];
      els: Array<{
        el: HTMLElement;
        type: keyof WindowEventMap;
      }>;
    }
  > = {};
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
  connected() { }
  disconnected() { }
  adoptied() { }
  propChanged(name: string, oldV: string, newV: string) { }
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

    if (El.nodeType !== 3) {
      return true;
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
      let replace: string = this[varItem].toString();
      ElHTML = ElHTML.replace(`\{${varItem}\}`, replace);
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
          const methodName: RegExpMatchArray = String(attrItem.value).match(
            /\w+(\(.+\))?;?/g
          );
          //* 清除DOMParser 加上的方法
          El[attrItem["localName"]] = null;

          for (const name of methodName) {
            const params = this._parserParams(name);
            const methodNameItem: RegExpMatchArray =
              name.match(/\w+(?=\(.+\))?/);
            if (methodNameItem === null) {
              continue;
            }

            let type: RegExpMatchArray =
              attrItem.localName.match(/(?<=on)\w+/g);
            if (type === null) {
              continue;
            }
            if (this._methods[methodNameItem[0]]) {
              this._methods[methodNameItem[0]].els.push({
                el: El,
                type: type[0] as keyof WindowEventMap,
              });
              console.log(this._methods[methodNameItem[0]]);
              El.addEventListener(
                type[0] as keyof WindowEventMap,
                this._methods[methodNameItem[0]].listener
              );
            } else {
              let listener = this[methodNameItem[0]].bind(this, ...params);

              this._methods[methodNameItem[0]] = {
                listener,
                els: [
                  {
                    type: type[0] as keyof WindowEventMap,
                    el: El,
                  },
                ],
                params,
              };
              El.addEventListener(type[0] as keyof WindowEventMap, listener);
            }
          }
        }
      });
    }

    return true;
  }
  _parserParams(paramsString: string): string[] {
    const paramsRaw: RegExpMatchArray =
      String(paramsString).match(/(?<=\().+(?=\))/);
    if (paramsRaw === null) {
      return [];
    }
    let params = [];
    if (paramsRaw !== null) {
      params = paramsRaw[0].split(",");
    }
    return params;
  }
  async setState<T>(key: string, value: T) {
    const state = this._state[key];
    if (typeof value === "function") {
      if (value.constructor.name === "AsyncFunction") {
        value = await value();
      } else {
        value = value();
      }
    }
    state.els.forEach((el) => {
      if (el.nodeType === 3) {
        el.textContent = el.textContent.replace(
          state.value.toString(),
          value.toString()
        );
      } else {
        el.innerText = el.innerText.replaceAll(state.value.toString(), value.toString());
      }
    });
    state.value = value;
  }
  async setMethod(name: string, func: Function | AsyncGeneratorFunction) {
    const method = this._methods[name];
    const listener = func.bind(this, ...method.params);

    method.els.forEach((elItem) => {
      elItem.el.removeEventListener(elItem.type, method.listener);
      elItem.el.addEventListener(elItem.type, listener);
    });
    method.listener = listener;
  }
}