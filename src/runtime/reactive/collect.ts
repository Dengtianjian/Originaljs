let El: HTMLElement | ShadowRoot;
let RefData: {} = {};
const BuildInComponentTagNames: string[] = ["o-for", "o-if", "o-else", "o-else-if"];

function parsePropertyString(rawString: string): string[] {
  if (/(?<=\])\w/.test(rawString) || /\W+^[\u4e00-\u9fa5]/.test(rawString)) {
    throw new Error("🐻兄dei，语法错误：" + rawString);
  }
  const splitChars: string[] = rawString.split("");
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
    throw new Error("🐻兄dei，语法错误：" + rawString);
  }

  return propertys;
}

function getProperty(propertyStrs: string[], refData: object): any {
  let property: any = refData;
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
function getPropertyData(propertyStrs: string[], refData: object) {
  let property: any = getProperty(propertyStrs, refData);
  if (typeof property === "function") {
    property = property();
  }
  return property;
}

function generateElRefTree(propertyNames: string[], El: HTMLElement | Text | Attr) {
  let tree = {};

  if (propertyNames.length === 1) {
    let propertyName: string = "_els";
    if (El instanceof Attr) {
      propertyName = "_attrs";
    }
    tree[propertyNames[0]] = {
      [propertyName]: [El]
    }
  } else {
    tree[propertyNames[0]] = generateElRefTree(propertyNames.slice(1), El);
  }

  return tree;
}

function objectAssign(target: object, source: object) {
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const targetItem = target[key];
      const sourceItem = source[key];
      if (typeof targetItem === "object") {
        if (key === "_els") {
          target[key] = target[key].concat(sourceItem);
        } else {
          target[key] = objectAssign(targetItem, sourceItem);
        }
      } else {
        target[key] = source[key];
      }
    }
  }
  return target;
}

function reset(El: HTMLElement, data: {}) {
  El = El;
  RefData = data;
  return collection(El);
}

function collection(El: HTMLElement) {
  let RefTree = collectTagRefs(El);
  parserRef(RefTree, RefData);
  return RefTree;
}

function collectTagRefs(El: HTMLElement): object {
  let ScopedElRefTree = {};
  if (El.nodeType === 1 && BuildInComponentTagNames.includes(El.tagName.toLowerCase())) {
    handleBuildInComponent(El);
  }

  if (El.childNodes.length > 0) {
    for (const childNode of Array.from(El.childNodes)) {
      ScopedElRefTree = objectAssign(ScopedElRefTree, collectTagRefs(childNode as HTMLElement));
    }
  }

  if (El.attributes && El.attributes.length > 0 && !BuildInComponentTagNames.includes(El.tagName.toLowerCase())) {
    ScopedElRefTree = objectAssign(ScopedElRefTree, collectAttrRefs(El));
  }

  if (El.nodeType !== 3) {
    return ScopedElRefTree;
  }

  let refs: RegExpMatchArray = El.textContent.match(/(?<=\{\x20*).+?(?=\x20*\})/g);
  if (refs === null) {
    return ScopedElRefTree;
  }
  const parentNode: HTMLElement = El.parentNode as HTMLElement;
  refs = Array.from(new Set(refs));
  const appendTextEls: Text[] = [];
  for (let index = 0; index < refs.length; index++) {
    const refRawString: string = refs[index].trim();
    const newTextEl: Text = document.createTextNode("{" + refRawString + "}");
    const propertyNames: string[] = parsePropertyString(refRawString);
    ScopedElRefTree = objectAssign(ScopedElRefTree, generateElRefTree(propertyNames, newTextEl));

    appendTextEls.push(newTextEl, document.createTextNode("\n"));
    const replaceRegString: string = "\{\x20*" + refRawString.replace(/([\.\[\]])/g, "\\$1") + "\x20*\}";
    El.textContent = El.textContent.replace(new RegExp(replaceRegString), "");
  }
  appendTextEls.forEach(el => {
    parentNode.insertBefore(el, El);
  });

  return ScopedElRefTree;
}

function collectAttrRefs(El: HTMLElement): object {
  let ScopedElRefTree = {};
  if (El.attributes.length === 0) {
    return ScopedElRefTree;
  }
  for (const attrItem of Array.from(El.attributes)) {
    if (/(?<=\{\x20*).+?(?=\x20*\})/.test(attrItem.nodeValue)) {
      const refs: string[] = attrItem.nodeValue.match(/(?<=\{\x20*).+?(?=\x20*\})/g);
      refs.forEach(refItem => {
        const propertyNames: string[] = parsePropertyString(refItem);
        const RefTree = generateElRefTree(propertyNames, attrItem);
        ScopedElRefTree = objectAssign(ScopedElRefTree, RefTree);
      });
    }
  }
  return ScopedElRefTree;
}

function handleBuildInComponent(El: HTMLElement) {
  const tagName: string = El.tagName.toLowerCase();
  switch (tagName) {
    case "o-for":
      handleOFor(El);
      break;
  }
}

function handleOFor(El: HTMLElement) {
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

  const propertyNames: string[] = parsePropertyString(propertyName);
  const property: any[] = getPropertyData(propertyNames, RefData);

  const newEls = [];
  property.forEach((item, pindex) => {
    const newEl = [...Array.from(childNodes)];
    newEl.forEach((el, index) => {
      newEl[index] = el.cloneNode(true);
      replaceRef(newEl[index] as HTMLElement, new RegExp(`(?<=\{\x20*)${itemName}`, "g"), `${propertyNames.join(".")}.${pindex}`);
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
function replaceRef(El: HTMLElement, string: string | RegExp, replaceValue: string) {
  if (El.childNodes.length > 0) {
    El.childNodes.forEach(node => {
      replaceRef(node as HTMLElement, string, replaceValue);
    })
  }

  if (El.attributes && El.attributes.length > 0) {
    replaceAttrRef(El, string, replaceValue);
  }

  if (El.nodeType !== 3) {
    return;
  }

  El.textContent = El.textContent.replace(string, replaceValue);
}
function replaceAttrRef(El: HTMLElement, string: string | RegExp, replaceValue: string) {
  if (El.attributes.length === 0) {
    return;
  }
  for (const attrItem of Array.from(El.attributes)) {
    if (/(?<=\{\x20*).+?(?=\x20*\})/.test(attrItem.nodeValue)) {
      attrItem.nodeValue = attrItem.nodeValue.replace(string, replaceValue);
    }
  }

}

function parserRef(refTree: object, rawData: object, path: string[] = []) {
  for (const branchName in refTree) {
    if (Object.prototype.hasOwnProperty.call(refTree, branchName)) {
      if (rawData[branchName]) {
        if (typeof rawData[branchName] === "object") {
          path.push(branchName);
          replaceRefContent(refTree, rawData, branchName, path);
          parserRef(refTree[branchName], rawData[branchName], path);
          path.pop();
        } else {
          replaceRefContent(refTree, rawData, branchName, path);
        }
      }
    }
  }
}

function replaceRefContent(refTree, rawData, branchName, path) {
  const replaceValue: string = rawData[branchName].toString();
  if (refTree[branchName]['_els'] && refTree[branchName]['_els'].length > 0) {
    refTree[branchName]['_els'].forEach(el => {
      el.textContent = replaceValue;
    })
  }
  if (refTree[branchName]['_attrs'] && refTree[branchName]['_attrs'].length > 0) {
    const attrs: Attr[] = refTree[branchName]['_attrs'];
    for (const attr of attrs) {
      let refs = attr.nodeValue.match(/(?<=\{\x20*).+?(?=\x20*\})/g);
      if (refs === null) {
        continue;
      }
      path.push(branchName);
      let pathString: string = path.join(".");
      refs.forEach(ref => {
        const propertyStrings: string[] = parsePropertyString(ref);
        if (pathString === propertyStrings.join(".")) {
          let replaceSource = ref.replace(/([\[\]\.])/g, "\\$1");
          attr.nodeValue = attr.nodeValue.replace(new RegExp(`\{\x20*${replaceSource}\x20*\}`, "g"), replaceValue);
        }
      })
      path.pop();
    }
  }
}

export default {
  reset,
  collection,
  collectTagRefs,
  collectAttrRefs
};