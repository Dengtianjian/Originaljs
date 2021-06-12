import { IElement, TMethodItem, TStateItem } from "../types/elementType";

export default class Element extends HTMLElement implements IElement {
  _customElement = true;
  $ref: Element | ShadowRoot | null = null;
  _state: Record<string, TStateItem> = {};
  _methods: Record<
    string,
    TMethodItem
  > = {};
  _props: Record<string, any> = {};
  static observedAttributes: string[] = [];
  constructor() {
    super();
    this.$ref = this.attachShadow({ mode: "closed" });
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
  propChanged(name: string, newV: string, oldV: string) { }
  private attributeChangedCallback(name: string, oldV: string, newV: string) {
    this.propChanged(name, newV, oldV);
  }
  render(): null | Node | NodeList | string {
    return null;
  }
  protected _render(): void {
    const template: string | Node | NodeList = this.render();

    let appendNodes: Node[] | NodeList = [];
    if (typeof template === "string") {
      const document: Document = new DOMParser().parseFromString(
        template,
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
      if (template instanceof NodeList) {
        appendNodes = appendNodes;
      } else {
        appendNodes = [template];
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

    // TODO 记录每个元素替换的位置和结束位置 索引
    if (El.attributes) {
      const attributes = Array.from(El.attributes);
      for (let index = 0; index < attributes.length; index++) {
        const attrItem = attributes[index];
        const vars: null | string[] = attrItem.nodeValue.match(/(?<=\{).+?(?=\})/g);

        if (vars === null) {
          continue;
        }
        let replaceContent: string = attrItem.nodeValue;
        vars.forEach((varItem) => {
          if (this[varItem] !== undefined) {
            let replace: string = this[varItem].toString();
            replaceContent = replaceContent.replace(`\{${varItem}\}`, replace);
          }

          if (!this._state[varItem]) {
            this._state[varItem] = {
              value: this[varItem],
              els: new Set(),
            };
          }
          this._state[varItem].els.add({
            attribute: attrItem,
            type: "attribute"
          });
        });
        attrItem.nodeValue = replaceContent;
      }
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
      if (this[varItem]) {
        let replace: string = this[varItem].toString();
        ElHTML = ElHTML.replace(`\{${varItem}\}`, replace);
      }

      if (!this._state[varItem]) {
        this._state[varItem] = {
          value: this[varItem],
          els: new Set(),
        };
      }
      this._state[varItem].els.add({
        el: El,
        type: "element"
      });
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

            const listener = this[methodNameItem[0]].bind(this, ...params);
            let type: RegExpMatchArray =
              attrItem.localName.match(/(?<=on)\w+/g);
            if (type === null) {
              continue;
            }
            if (!this._methods[methodNameItem[0]]) {
              this._methods[methodNameItem[0]] = [];
            }
            this._methods[methodNameItem[0]].push({
              el: El,
              type: type[0] as keyof WindowEventMap,
              listener,
              params
            });
            El.addEventListener(
              type[0] as keyof WindowEventMap,
              listener
            );
          }
          El.removeAttribute(attrItem["localName"]);
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
    if (state) {
      if (typeof value === "function") {
        if (value.constructor.name === "AsyncFunction") {
          value = await value();
        } else {
          value = value();
        }
      }
      for (let index = 0; index < Array.from(state.els).length; index++) {
        const elItem = Array.from(state.els)[index];
        if (elItem.type === "attribute") {
          if (/^on\w+/.test(elItem.attribute.nodeName)) {
            if (elItem.attribute.value.includes(this[key]) &&
              /^\w+(\(\))?/.test(elItem.attribute.value)) {
              const methodName: RegExpMatchArray = String(elItem.attribute.value).match(
                /\w+(\(.+\))?;?/g
              );
              if (methodName === null) {
                continue;
              }
              for (let nameItem of methodName) {
                nameItem = nameItem.replaceAll(state.value.toString(), value.toString());
                const params = this._parserParams(nameItem);
                const methodNameItem: RegExpMatchArray =
                  nameItem.match(/\w+(?=\(.+\))?/);
                if (methodNameItem === null) {
                  continue;
                }
                this.setMethod(methodNameItem[0], this[methodNameItem[0]], params);
              }
            }
          } else {
            elItem.attribute.nodeValue = elItem.attribute.nodeValue.replaceAll(state.value.toString(), value.toString());
          }
        } else {
          if (elItem.el.nodeType === 3) {
            elItem.el.textContent = elItem.el.textContent.replace(
              state.value.toString(),
              value.toString()
            );
          } else {
            elItem.el.innerHTML = elItem.el.innerHTML.replaceAll(state.value.toString(), value.toString());
          }
        }
      }
      state.value = value;
    }

    this[key] = value;
  }
  async setMethod(name: string, func: Function | AsyncGeneratorFunction, params: any[] = []) {
    const els = this._methods[name];
    els.forEach(elItem => {
      const listener = func.bind(this, ...params);
      elItem.el.removeEventListener(elItem.type, elItem.listener);
      elItem.el.addEventListener(elItem.type, listener);
      elItem.listener = listener;
      elItem.params = params;
    })
  }
}