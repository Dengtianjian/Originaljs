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
  static generateObject(propertyNames: string[], data, El: HTMLElement | Text
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
      Object.defineProperty(obj[propertyNames[0]], "_els", {
        value: [
          El
        ],
        writable: true,
        configurable: true,
        enumerable: true
      })
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
          if (key === "_els") {
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
  static collection(El: HTMLElement) {
    if (El.childNodes.length > 0) {
      for (const child of Array.from(El.childNodes)) {
        this.collection(child as HTMLElement);
      }
    }

    if (El.nodeType !== 3 && El !== this.El) {
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
      let replaceValue: string = replace.toString();
      replaceValue += " ";
      const textEl = document.createTextNode(replaceValue);
      const obj = this.generateObject(propertyNames, this.data, textEl);
      this.obj = this.mergeObject(this.obj, obj)
      textEls.push(textEl);
    }

    parentNode.append(...textEls);
    parentNode.removeChild(El);
  }
}