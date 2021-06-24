import { IElement } from "../../types/elementType";
import { IPluginItem, IPlugins, TRefTree } from "../../types/pluginType";
import Plugin from "../plugin";

let El: HTMLElement | ShadowRoot;
let RefData: {} = {};

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

function deepGenerateTree(branchs: string[], lastBranch: {} = {}) {
  let tree = {};

  if (branchs.length === 1) {
    tree[branchs[0]] = lastBranch;
  } else {
    tree[branchs[0]] = deepGenerateTree(branchs.slice(1), lastBranch);
  }
  return tree;
}
function generateElRefTree(propertyNames: string[], El: HTMLElement | Text | Attr) {
  let tree = {};

  let propertyName: string = "__els";
  if (El instanceof Attr) {
    propertyName = "__attrs";
  }

  tree = deepGenerateTree(propertyNames, {
    [propertyName]: [El]
  });
  return tree;
}

function objectAssign(target: object, source: object) {
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const targetItem = target[key];
      const sourceItem = source[key];
      if (typeof targetItem === "object") {
        if (key === "__els") {
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

function reset(El: IElement, data: {}) {
  El = El;
  RefData = data;
  return collection(El);
}

function collection(El: IElement): TRefTree {
  let ScopedElRefTree = {};

  const Plugins: IPlugins = Plugin.use() as IPlugins;
  for (const plugiName in Plugins) {
    if (Object.prototype.hasOwnProperty.call(Plugins, plugiName)) {
      const pluginItem: IPluginItem = Plugins[plugiName];
      if (pluginItem.collectRef) {
        ScopedElRefTree = objectAssign(ScopedElRefTree, pluginItem.collectRef(El, RefData));
      }
    }
  }

  parserRef(ScopedElRefTree, RefData);
  return ScopedElRefTree;
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
  if (refTree[branchName]['__els'] && refTree[branchName]['__els'].length > 0) {
    refTree[branchName]['__els'].forEach(el => {
      el.textContent = replaceValue;
    })
  }
  if (refTree[branchName]['__attrs'] && refTree[branchName]['__attrs'].length > 0) {
    const attrs: Attr[] = refTree[branchName]['__attrs'];
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
  parsePropertyString,
  getProperty,
  getPropertyData,
  objectAssign,
  generateElRefTree,
  deepGenerateTree
};