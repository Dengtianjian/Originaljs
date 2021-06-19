let El: HTMLElement | ShadowRoot;
let RefData: {} = {};
let ElRefTree = {};
const BuildInComponentTagNames: string[] = ["o-for"];

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

function generateElRefTree(propertyNames: string[], rawData: object, El: HTMLElement | Text | Attr): {} | [] {
  let tree: {} | [] = {};
  if (Array.isArray(rawData)) {
    tree = [];
  }

  if (typeof rawData[propertyNames[0]] === "object" && propertyNames.length > 1) {
    tree[propertyNames[0]] = generateElRefTree(propertyNames.slice(1), rawData[propertyNames[0]], El);
  } else {
    if (Array.isArray(rawData[propertyNames[0]])) {
      tree[propertyNames[0]] = [];
    } else {
      tree[propertyNames[0]] = {};
    }
    let propertyName: string = "_els";
    if (El instanceof Attr) {
      propertyName = "_attrs";
    }
    tree[propertyNames[0]][propertyName] = [
      El
    ]
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
  collection(El);
  console.log(ElRefTree);
}

function collection(El: HTMLElement) {
  collectTagRefs(El);
}

function collectTagRefs(El: HTMLElement): void {
  if (El.childNodes.length > 0) {
    for (const childNode of Array.from(El.childNodes)) {
      collection(childNode as HTMLElement);
    }
  }

  if (El.attributes && El.attributes.length > 0 && !BuildInComponentTagNames.includes(El.tagName.toLowerCase())) {
    collectAttrRefs(El);
  }

  if (El.nodeType !== 3) {
    return;
  }

  let refs: RegExpMatchArray = El.textContent.match(/(?<=\{\x20*).+?(?=\x20*\})/g);
  if (refs === null) {
    return;
  }
  const parentNode: HTMLElement = El.parentNode as HTMLElement;
  refs = Array.from(new Set(refs));
  const appendTextEls: Text[] = [];
  for (let index = 0; index < refs.length; index++) {
    const refRawString: string = refs[index].trim();
    const newTextEl: Text = document.createTextNode("{" + refRawString + "}");
    const propertyNames: string[] = parsePropertyString(refRawString);
    const RefTree = generateElRefTree(propertyNames, RefData, newTextEl);

    ElRefTree = objectAssign(ElRefTree, RefTree);

    appendTextEls.push(newTextEl);
    appendTextEls.push(document.createTextNode("\n"));
    const replaceRegString: string = "\{\x20*" + refRawString.replace(/([\.\[\]])/g, "\\$1") + "\x20*\}";
    El.textContent = El.textContent.replace(new RegExp(replaceRegString), "");
  }
  appendTextEls.forEach(el => {
    parentNode.insertBefore(el, El);
  });
}
function collectAttrRefs(El: HTMLElement): void {
  if (El.attributes.length === 0) {
    return;
  }
  for (const attrItem of Array.from(El.attributes)) {
    if (/(?<=\{\x20*).+?(?=\x20*\})/.test(attrItem.nodeValue)) {
      const refs: string[] = attrItem.nodeValue.match(/(?<=\{\x20*).+?(?=\x20*\})/g);
      refs.forEach(refItem => {
        const propertyNames: string[] = parsePropertyString(refItem);
        const RefTree = generateElRefTree(propertyNames, RefData, attrItem);
        ElRefTree = objectAssign(ElRefTree, RefTree);
      });
    }
  }
}

export default {
  reset,
  collection,
  collectTagRefs,
  collectAttrRefs
};