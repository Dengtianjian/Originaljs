//* reset -> collection -> parse {} -> get data[xxx] -> propertyNames to object -> return obj
/**
 * source a > arr[] > *
 * source a > user > name
 * to
 * a > arr[] > *
 *  -> user > name
 * delete a.arr[]
 */
export class Collect {
  static data;
  static obj = {};
  static El;
  static buildInComponentTagNames = ["o-for"];
  static parsePropertyString(propertyString: string): string[] {
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
  static getProperty(propertyStrs: string[]): any {
    let property: any = this.data;
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
  static getPropertyData(propertyStrs: string[]) {
    let property: any = this.getProperty(propertyStrs);
    if (typeof property === "function") {
      property = property();
    }
    return property;
  }
  static generateObject(propertyNames: string[], data, El: HTMLElement | Text | Attr
  ) {
    let obj = {};
    if (Array.isArray(data)) {
      obj = [];
    }
    let property = data;

    if (typeof property[propertyNames[0]] === "object" && propertyNames.length > 1) {
      obj[propertyNames[0]] = this.generateObject(propertyNames.slice(1), data[propertyNames[0]], El);
    } else {
      if (Array.isArray(property[propertyNames[0]])) {
        obj[propertyNames[0]] = [];
      } else {
        obj[propertyNames[0]] = {};
      }
      if (El instanceof Attr) {
        obj[propertyNames[0]]['__attrs'] = [
          El
        ]
      } else {
        obj[propertyNames[0]]['__els'] = [
          El
        ]
      }
      // obj[propertyNames[0]]['_type'] = "element";
      // Object.defineProperty(obj[propertyNames[0]], "__els", {
      //   value: [
      //     El
      //   ],
      //   writable: true,
      //   configurable: true,
      //   enumerable: true
      // })
      // Object.defineProperty(obj[propertyNames[0]], "_type", {
      //   value: "element",
      //   writable: true,
      //   configurable: true,
      //   enumerable: true
      // })
    }
    return obj;
  }
  static reset(El, data) {
    this.El = El;
    this.data = data;
    this.collection(El);
    return this.obj;
  }
  static mergeObject(target, source) {
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const targetItem = target[key];
        const sourceItem = source[key];
        if (typeof targetItem === "object") {
          if (key === "__els") {
            target[key] = target[key].concat(sourceItem);
          } else {
            target[key] = this.mergeObject(targetItem, sourceItem);
          }
        } else {
          target[key] = source[key];
        }
      }
    }
    return target;
  }
  static collectAttrRef(El: HTMLElement) {
    for (const attrItem of Array.from(El.attributes)) {
      if (/(?<=\{\x20*).+?(?=\x20*\})/g.test(attrItem.nodeValue)) {
        const refs: string[] = attrItem.nodeValue.match(/(?<=\{\x20*).+?(?=\x20*\})/g);
        refs.forEach(refItem => {
          const propertyNames: string[] = this.parsePropertyString(refItem);
          let replace: undefined | string = this.getPropertyData(propertyNames);
          let replaceValue: string = "";
          if (replace) {
            replaceValue = replace.toString();
            replaceValue += " ";
          }
          attrItem.nodeValue = replace;
          const obj = this.generateObject(propertyNames, this.data, attrItem);
          this.obj = this.mergeObject(this.obj, obj)
        })
      }
    }
  }
  static collection(El: HTMLElement) {
    if (this.buildInComponentTagNames.includes(String(El.tagName).toLowerCase())) {
      this.handleBuildInComponent(El);
    }

    if (El.childNodes.length > 0) {
      for (const child of Array.from(El.childNodes)) {
        this.collection(child as HTMLElement);
      }
    }

    if (El.attributes && El.attributes.length > 0) {
      this.collectAttrRef(El);
    }

    if (El.nodeType !== 3) {
      return;
    }

    const vars = El.textContent.match(/(?<=\{\x20*).+?(?=\x20*\})/g);
    if (vars === null) {
      return;
    }

    const parentNode: HTMLElement = El.parentNode as HTMLElement;
    const textEls: Text[] = [];
    for (let index = 0; index < vars.length; index++) {
      vars[index] = vars[index].trim();
      const varItem = vars[index];
      const propertyNames = this.parsePropertyString(varItem);
      let replace: undefined | string = this.getPropertyData(propertyNames);
      let replaceValue: string = `{${varItem}}`;
      if (replace) {
        replaceValue = replace.toString();
        replaceValue += " ";
      }
      const textEl = document.createTextNode(replaceValue);
      const obj = this.generateObject(propertyNames, this.data, textEl);
      this.obj = this.mergeObject(this.obj, obj)
      textEls.push(textEl);
    }
    parentNode.append(...textEls);
    parentNode.removeChild(El);
  }
  static handleBuildInComponent(El: HTMLElement) {
    const tagName: string = El.tagName.toLowerCase();
    switch (tagName) {
      case "o-for":
        this.handleOFor(El);
        break;
    }
  }
  static handleOFor(El: HTMLElement) {
    const attributes: Attr[] = Array.from(El.attributes);
    let InIndex: number = -1;
    let indexName: string = "";
    let propertyName: string = "";
    let keyName: string = "";
    let itemName: string = "";
    const childNodes: Node[] = [];
    El.childNodes.forEach(node => {
      childNodes.push(node.cloneNode(true));
    });

    attributes.forEach((attr, index) => {
      if (attr.nodeName === "in") {
        InIndex = index;
      }
    });

    propertyName = attributes[InIndex + 1]['nodeName'];
    if (InIndex == 2) {
      indexName = attributes[InIndex - 1]['nodeName'];
      itemName = attributes[InIndex - 2]['nodeName'];
    } else if (InIndex == 3) {
      keyName = attributes[InIndex - 1]['nodeName'];
      indexName = attributes[InIndex - 2]['nodeName'];
      itemName = attributes[InIndex - 3]['nodeName'];
    } else {
      itemName = attributes[InIndex - 1]['nodeName'];
    }

    const propertyNames: string[] = this.parsePropertyString(propertyName);
    const property: any[] = this.getPropertyData(propertyNames);

    const newEls = [];
    property.forEach((item, pindex) => {
      const newEl = [...Array.from(childNodes)];
      newEl.forEach((el, index) => {
        newEl[index] = el.cloneNode(true);
        newEl[index].textContent = newEl[index].textContent.replace(new RegExp(`(?<=\{)${itemName}`), `${propertyNames.join(".")}.${pindex}`);
      })
      newEls.push(newEl);
    });

    Array.from(El.children).forEach(node => {
      El.removeChild(node);
    })
    newEls.forEach(els => {
      El.append(...els);
    });
  }
}