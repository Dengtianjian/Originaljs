import { TStateItem } from "../types/elementType";

export class _Reactive {
  _target: HTMLElement | ShadowRoot;
  _state: Record<string, TStateItem> = {};
  _keys: Set<string> = new Set();
  _data;
  _tags: string[] = ["o-for"]; //* 自带标签
  constructor(target: HTMLElement | ShadowRoot, data: any) {
    this._target = target;
    this._data = data;

    this.collection(this._target as HTMLElement).then(res => {
      this.setProxy();
    })
  }
  async collection(El: HTMLElement) {
    if (El.tagName && this._tags.includes(El.tagName.toLowerCase())) {
      this.handleBuildInComponents(El);
    }

    if (El.childNodes.length > 0) {
      El.childNodes.forEach((node) => {
        this.collection(node as HTMLElement);
      });
    }

    if (El.attributes) {
      const attributes = Array.from(El.attributes);
      for (let index = 0; index < attributes.length; index++) {
        const attrItem = attributes[index];

        const vars: null | string[] = attrItem.value.match(/(?<=\{).+?(?=\})/g);

        if (vars === null) {
          continue;
        }
        let replaceContent: string = attrItem.value;

        for (let index = 0; index < vars.length; index++) {
          const varItem = vars[index];
          const attrValue: undefined | string = await this.getPropertyData(this.parsePropertyString(varItem));

          let replaceValue: string = "";
          if (attrValue === undefined) {
            replaceValue = `{${varItem}}`;
          } else {
            replaceValue = attrValue.toString();
          }
          replaceContent = replaceContent.replaceAll(`{${varItem}}`, replaceValue);

          if (!this._state[varItem]) {
            this._state[varItem] = {
              value: attrValue,
              els: new Set(),
            };
          }
          this._state[varItem].els.add({
            attribute: attrItem,
            type: "attribute"
          });
          this._keys.add(varItem);
        }
        attrItem.value = replaceContent;
      }
    }

    if (El.nodeType !== 3) {
      return true;
    }

    let ElHTML: string = El.textContent;

    const vars: null | string[] = ElHTML.match(/(?<=\{).+?(?=\})/g);
    if (vars === null) {
      return true;
    }

    const parentNode: HTMLElement = El.parentNode as HTMLElement;
    const textEls: Text[] = [];
    for (let index = 0; index < vars.length; index++) {
      const varItem = vars[index];
      let replace: undefined | string = await this.getPropertyData(this.parsePropertyString(varItem));
      let replaceValue: string = ""
      if (replace === undefined) {
        replaceValue = `{${varItem}}`;
      } else {
        replaceValue = replace.toString();
      }
      if (new RegExp(`[ ]`).test(El.textContent) && index !== vars.length - 1) {
        replaceValue += " ";
      }
      const textEl = document.createTextNode(replaceValue);
      this._keys.add(varItem);
      if (!this._state[varItem]) {
        this._state[varItem] = {
          value: replace,
          els: new Set(),
        };
      }
      this._state[varItem].els.add({
        el: textEl,
        type: "element"
      });
      textEls.push(textEl);
    }
    parentNode.removeChild(El);
    parentNode.append(...textEls);
    return true;
  }
  parsePropertyString(propertyString: string): string[] {
    if (/(?<=\])\w/.test(propertyString) || /\W+^[\u4e00-\u9fa5]/.test(propertyString)) {
      throw new Error("🐻兄dei，语法错误：" + propertyString);
    }

    let propertyStringCharts: string[] = propertyString.split("");
    const propertys: string[] = [];
    let fragment: string = "";
    let around: number = 0;
    let hitComma: boolean = false;
    propertyStringCharts.forEach((charItem) => {
      switch (charItem) {
        case "[":
          around++;
          if (fragment) {
            propertys.push(fragment);
          }
          fragment = "";
          break;
        case "]":
          around--;
          if (fragment) {
            propertys.push(fragment);
            fragment = "";
          }
          break;
        case ".":
          if (fragment) {
            propertys.push(fragment);
          }
          fragment = "";
          hitComma = true;
          break;
        default:
          hitComma = false;
          if (!["'", "\"", "\\"].includes(charItem)) {
            fragment += charItem.trim();
          }
          break;
      }
    })
    if (fragment) {
      hitComma = false;
      propertys.push(fragment);
      fragment = "";
    }
    if (hitComma !== false || around !== 0) {
      throw new Error("🐻兄dei，语法错误：" + propertyString);
    }
    return propertys;
  }
  getProperty(propertyStrs: string[]): any {
    let property: any = this._data;
    for (const name of propertyStrs) {
      property = property[name];
      if (property === undefined) {
        console.warn(`
          CM:存在未定义的响应式变量: ${name} 。路径：${propertyStrs.join("-> ")}。
          EN:undefined reactive variables: ${name} . Path:${propertyStrs.join("-> ")}.
        `);
        break;
      }
    }

    return property;
  }
  async getPropertyData(propertyStrs: string[]): Promise<any> {
    let property: any = this.getProperty(propertyStrs);
    if (typeof property === "function") {
      if (Object.prototype.toString.call(property) === "[object AsyncFunction]") {
        property = await property();
      } else {
        property = property();
      }
    }
    return property;
  }
  setProxy() {
    this._keys.forEach(keyItem => {
      const propertyStrs: string[] = this.parsePropertyString(keyItem);
      const lastStr: string = propertyStrs[propertyStrs.length - 1];
      let property = this.getProperty(propertyStrs.slice(0, -1))
      const targetName: string = propertyStrs[propertyStrs.length - 1];

      this.setObjectProxy(propertyStrs, targetName, this._data, keyItem);
    })
  }
  setObjectProxy(propertyStrs: string[], targetName: string, target: any, stateKey: string) {
    if (propertyStrs[0] !== targetName) {
      return this.setObjectProxy(propertyStrs.slice(1), targetName, target[propertyStrs[0]], stateKey);
    } else if (target) {
      if (typeof target[targetName] === "object") {
        target[targetName] = new Proxy(target[targetName], this.ProxyHandler);
        Object.defineProperty(target[targetName], "_stateKey", {
          value: "nums",
          configurable: false,
          writable: false,
          enumerable: false
        })
      } else {
        target[targetName] = new Proxy({
          value: target[targetName],
          _upperKey: propertyStrs[0],
          _stateKey: stateKey
        }, this.ProxyHandler);
      }
    }
    return true;
  }
  ProxyHandler: ProxyHandler<any> = {
    set: (target: any, propertyKey: string | symbol, value: any, receiver: any) => {
      let reflectResult: boolean = Reflect.set(target, propertyKey, value, receiver);
      if (reflectResult) {
        this.updateView(target, propertyKey, value, receiver);
      }
      return reflectResult;
    }
  }
  async updateView(target: { _upperKey: string, _stateKey: string, [key: string]: any }, propertyKey: PropertyKey, value: any, receiver?: any): Promise<boolean> {
    const { _upperKey, _stateKey } = target;
    const state: TStateItem = this._state[_stateKey];

    let replaceValue: string = "";
    if (typeof value === "function") {
      if (Object.prototype.toString.call(value) === "[object AsyncFunction]") {
        replaceValue = await value();
      } else {
        replaceValue = value();
      }
    } else {
      replaceValue = value.toString();
    }
    state.els.forEach(elItem => {
      switch (elItem.type) {
        case "element":
          elItem.el.textContent = replaceValue;
          break;
        case "attribute":
          elItem.attribute.value = replaceValue;
          break;
        case "for":
          this.updateForView(elItem.el, target);
          break;
      }
    });
    return true;
  }
  handleBuildInComponents(El: HTMLElement) {
    switch (El.tagName.toLowerCase()) {
      case "o-for":
        this.handleFor(El);
        break;
    }
  }
  async handleFor(El: HTMLElement) {
    const attributeMap: NamedNodeMap = El.attributes;
    const attributes: Attr[] = Array.from(attributeMap);
    let propertyName: string = "";
    let indexName: string = "";
    let itemName: string = attributes[0].nodeName;
    let keyName: string = "";
    attributes.forEach((attr, index, arr) => {
      if (attr.nodeName === "in") {
        propertyName = arr[index + 1].nodeName;
      }
    });
    if (attributes[1].nodeName !== "in") {
      indexName = attributes[1].nodeName;
      if (attributes[2].nodeName !== "in") {
        keyName = attributes[2].nodeName;
      }
    }
    if (!this._state[propertyName]) {
      const value = await this.getPropertyData(this.parsePropertyString(propertyName));
      this._state[propertyName] = {
        value,
        els: new Set()
      }
    }

    const templateEl: HTMLElement = El.children[0] as HTMLElement;
    const newChilds: HTMLElement[] = [];
    this._state[propertyName].value.forEach((item, index) => {
      const newChild: HTMLElement = templateEl.cloneNode(true) as HTMLElement;
      newChild['_for'] = {
        [itemName || "index"]: item,
        [indexName]: index,
        itemName,
        propertyName,
        indexName,
        keyName
      };
      newChild['_reacrive'] = new Reactive(newChild, newChild['_for']);
      newChilds.push(newChild)
    })
    El.removeChild(templateEl);
    El.append(...newChilds);
    this._state[propertyName].els.add({
      el: El,
      type: "for",
      template: templateEl
    });
  }
  updateForView(El, target) {
    const childres = El.children;
    console.log(childres[0]['_for'], target);
    // childres[0]['_for']['dataitem']['value'] = Date.now();
  }
}