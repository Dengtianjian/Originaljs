function generateObjectTree(keys: string[], rootValue: {}) {
  let obj = {};
  if (keys.length === 0) {
    return rootValue;
  } else {
    obj[keys[0]] = generateObjectTree(keys.slice(1), rootValue);
  }

  return obj;
}

function objectMerge(target: any, source: any): void {
  if (typeof target !== "object" || typeof source !== "object") return;
  if (source instanceof Map || target instanceof Map) {
    if (target instanceof Map && source instanceof Map) {
      source.forEach((item, key) => {
        if (target.has(key)) {
          objectMerge(target.get(key), item);
        } else {
          target.set(key, item);
        }
      });
    } else if (typeof target === "object" && source instanceof Map) {
      source.forEach((item, key) => {
        target[key] = item;
      });
    } else {
      target = source;
    }
  } else if (Array.isArray(target) || Array.isArray(source)) {
    if ((Array.isArray(target) && !Array.isArray(source)) || (!Array.isArray(target) && Array.isArray(source))) {
      target = source;
    } else {
      target.push(...source);
    }
  } else if (source !== null && typeof source === "object" && target !== null) {
    for (const key in source) {
      if (source.hasOwnProperty(key) === false) continue;
      if (target.hasOwnProperty(key) && typeof target[key] === "object" && typeof source[key] === "object") {
        objectMerge(target[key], source[key]);
      } else if (target instanceof Map) {
        target.set(key, source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
}

function getObjectProperty(target: object, propertyNames: (string | symbol)[]): any {
  if (typeof target[propertyNames[0]] === "object") {
    if (propertyNames.slice(1).length > 0) {
      return getObjectProperty(target[propertyNames[0]], propertyNames.slice(1));
    }
    return target[propertyNames[0]];
  }
  return target[propertyNames[0]];
}

function parseDom(HTMLString: string): Node[] {
  const document: Document = new DOMParser().parseFromString(HTMLString, "text/html");

  return [
    ...Array.from(document.head.childNodes),
    ...Array.from(document.body.childNodes)
  ];
}

function collectRefs(childNodes, targetRefTree, instance) {
  for (let index = 0; index < childNodes.length; index++) {
    const childNode = childNodes[index];
    if (childNode.nodeType !== 3) {
      if (childNode.tagName === "O-FOR") {
        let forItemName = childNode.attributes[0]['name'];
        let replaceRule = new RegExp(`{ *${forItemName}`, "ig");
        let forValue = childNode.attributes['in']['value'];
        let template = childNode.innerHTML;
        objectMerge(targetRefTree, {
          [forValue]: {
            __fors: {
              target: childNode,
              template,
              forItemName
            }
          }
        });
        childNode.innerHTML = "";
        let data = instance[forValue];
        for (const key in data) {
          childNode.innerHTML += template.replaceAll(replaceRule, `{ ${forValue}[${key}]`);
        }
      }
      if (childNode.childNodes.length > 0) {
        collectRefs(Array.from(childNode.childNodes), targetRefTree, instance);
      }
      continue;
    }
    const expressions = childNode.textContent.match(/(?<=\{).+(?=\})/g);
    if (expressions === null) continue;

    expressions.forEach(expression => {
      let expressionRaw = expression;
      let refs = expression.match(/(?<=\{).+?(?=\})/g);

      refs = Array.from(new Set(refs));
      refs.forEach(item => {
        let targetKey = item.trim();
        let target = instance[targetKey];
        expression = expression.replaceAll(`{${item}}`, `this.${item.trim()}`);

        if (typeof target !== "function") {
          const keys = targetKey.split(".");
          let refTree = generateObjectTree(keys, {
            __els: [{
              target: childNode,
              expression
            }]
          });
          objectMerge(targetRefTree, refTree);
        }
      });

      // let result = new Function(`return ${expression}`).call(instance);
      // childNode.textContent = childNode.textContent.replace(`{${expressionRaw}}`, result);
    })
  }
}

function updateViewBefore(target: any, keys: string[], refTree, propertyKey: string, value: any, receiver, instance) {
  let targetRefTree = refTree['users'];

  if (targetRefTree && typeof value === "object" && targetRefTree.__fors) {
    let fors = targetRefTree.__fors;
    // console.log(fors);

    let replaceRule = new RegExp(`{ *${fors.forItemName}`, "ig");
    let template = fors.template;
    template = template.replaceAll(replaceRule, `{ ${fors.forValue}[${propertyKey}]`);
    // console.log(template);

    let childNodes = parseDom(template);
    collectRefs(childNodes, refTree, instance);
    childNodes.forEach(childNode => {
      fors.target.append(childNode);
    });

    value = setProxy(value, refTree, instance);
  }
  Reflect.set(target, propertyKey, value, receiver);
}

function updateView(keys: string[], refTree, propertyKey: string, instance) {
  let targetRefTree: {
    __els?: Array<{
      expression: string,
      target: Text
    }>,
    __fors?: {
      target: HTMLElement,
      template: string,
      forItemName: string,
      forValue: string
    }
  } = getObjectProperty(refTree, keys);

  if (targetRefTree) {
    if (targetRefTree.__els) {
      targetRefTree.__els.forEach(item => {
        item.target.textContent = new Function(`return ${item.expression}`).call(instance);
      })
    }

    if (targetRefTree.__fors) {
      let fors = targetRefTree.__fors;
      if (fors.forValue === propertyKey) {
        const updateData = getObjectProperty(instance, keys);

        Array.from(fors.target.children).forEach(chilrenItem => {
          fors.target.removeChild(chilrenItem);
        });

        for (const key in updateData) {
          let replaceRule = new RegExp(`{ *${fors.forItemName}`, "ig");
          fors.target.innerHTML += fors.template.replaceAll(replaceRule, `{ this.${fors.forValue}[${key}]`);
        }
      }
    }
  }
  if (keys.length > 1) {
    propertyKey = keys.pop();
    updateView(keys, refTree, propertyKey, instance);
  }
}

function setProxy(target, refTree, instance) {
  return new Proxy(target, {
    set(target, propertyKey, value, receiver): boolean {
      let keys: string[] = target.__path.split(".");
      keys = keys.filter(item => item);
      keys.push(propertyKey.toString());

      updateViewBefore(target, keys, refTree, propertyKey.toString(), value, receiver, instance);
      updateView(keys, instance.refTree, propertyKey.toString(), instance);
      return true;
    }
  });
}

function deepSetProxy(refTree, refData, instance: CustomElement, paths: string = "") {
  for (const key in refTree) {
    if (refData[key] === undefined) continue;
    if (typeof refTree[key] === "object") {
      refData[key]['__path'] = [...paths.split("."), key].join(".");
      deepSetProxy(refData[key], refData[key], instance, refData[key]['__path']);
      refData[key] = setProxy(refData[key], refTree, instance)
      // new Proxy(refData[key], {
      //   set(target, propertyKey, value, receiver): boolean {
      //     let keys: string[] = target.__path.split(".");
      //     keys = keys.filter(item => item);
      //     keys.push(propertyKey.toString());

      //     if (typeof value === "object") {
      //       deepSetProxy(refTree, value, instance);
      //     }
      //     Reflect.set(target, propertyKey, value, receiver);
      //     updateView(keys, refTree, propertyKey.toString(), instance);

      //     return true;
      //   }
      // });
    } else {
      continue;
    }
  }
}

function reflectSetProperty(object, keys, value) {
  if (keys.length === 1) {
    Reflect.set(object, keys[0], value, object);
    return;
  }
  object = object[keys[0]];
  return reflectSetProperty(object, keys.slice(1), value);
}

function transformPropertyKeyToArray(propertyNameString: string): string[] {
  const splitChars: string[] = propertyNameString.split("");
  const propertys: string[] = [];
  let fragment: string = ""; //* [] 段
  let arounds: number = 0; //* 记录遇到了 [ 的次数
  let hitComma: boolean = false; //* 命中了逗号 .
  splitChars.forEach(charItem => {
    switch (charItem) {
      case "[":
        //* 进入包围圈
        ++arounds;
        //* 把以后的Push
        if (fragment) {
          propertys.push(fragment);
        }
        //* 清空存储的，重新开始记录属性名
        fragment = "";
        break;
      case "]":
        //* 进入包围圈的数量递减
        --arounds;
        if (fragment) {
          propertys.push(fragment);
        }
        fragment = "";
        break;
      case ".":
        //* 把已有的push
        //* 然后清空，重新开始记录属性名
        if (fragment) {
          propertys.push(fragment);
          fragment = "";
        }
        //* 命中了 .
        hitComma = true;
        break;
      default:
        hitComma = false;
        if (!["'", "\"", "\\"].includes(charItem)) {
          fragment += charItem.trim();
        }
        break;
    }
  });
  if (fragment) {
    hitComma = false;
    propertys.push(fragment);
    fragment = "";
  }

  if (hitComma || arounds) {
    throw new Error("Template syntax error:" + propertyNameString);
  }

  return propertys;
}

export default class CustomElement extends HTMLElement {
  shadowEl: ShadowRoot;
  private refTree = {};
  constructor(props: string[]) {
    super();
    this.shadowEl = this.attachShadow({
      mode: "closed"
    });
  }
  render(template: string) {
    this.shadowEl.innerHTML = template;
    this.collectRefs(Array.from(this.shadowEl.childNodes));
    deepSetProxy(this.refTree, this, this);
  }
  updateData(propertyKey, value) {
    let keys = propertyKey.split(".");
    reflectSetProperty(this, keys, value);
    updateView(keys, this.refTree, propertyKey, this);
    this.collectRefs(Array.from(this.childNodes));
  }
  collectRefs(childNodes) {
    for (let index = 0; index < childNodes.length; index++) {
      const childNode = childNodes[index];
      if (childNode.nodeType !== 3) {
        if (childNode.tagName === "O-FOR") {
          let forItemName = childNode.attributes[0]['name'];
          let replaceRule = new RegExp(`{ *${forItemName}`, "ig");
          let forValue = childNode.attributes['in']['value'];
          let template = childNode.innerHTML;
          let targetRefTree = generateObjectTree(forValue.split("."), {
            __fors: {
              target: childNode,
              template,
              forItemName,
              forValue
            }
          })
          objectMerge(this.refTree, targetRefTree);
          childNode.innerHTML = "";
          let data = getObjectProperty(this, forValue.split("."));
          for (const key in data) {
            childNode.innerHTML += template.replaceAll(replaceRule, `{ ${forValue}[${key}]`);
          }
        }
        if (childNode.childNodes.length > 0) {
          this.collectRefs(Array.from(childNode.childNodes));
        }
        continue;
      }
      const expressions = childNode.textContent.match(/(?<=\{).+(?=\})/g);
      if (expressions === null) continue;

      expressions.forEach(expression => {
        let expressionRaw = expression;

        let refs = expression.match(/(?<=\{).+?(?=\})/g);

        refs = Array.from(new Set(refs));
        refs.forEach(item => {
          let targetKey = item.trim();
          let target = this[targetKey];

          expression = expression.replaceAll(`{${item}}`, `this.${item.trim()}`);

          if (typeof target !== "function") {
            const keys = transformPropertyKeyToArray(targetKey);
            let refTree = generateObjectTree(keys, {
              __els: [{
                target: childNode,
                expression
              }]
            });
            objectMerge(this.refTree, refTree);
          }
        });

        let result = new Function(`return ${expression}`).call(this);
        childNode.textContent = childNode.textContent.replace(`{${expressionRaw}}`, result);
      })
    }
  }
}