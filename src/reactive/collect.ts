import { IElement } from "../types/elementType";
import { IPluginItem, IPlugins, TRefTree } from "../types/pluginType";
import Plugin from "../plugin";
import Parser from "./parser";
import utils from "../utils";

let El: HTMLElement | ShadowRoot;
let RefData: {} = {};

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

  let propertyName: string = "__els";
  if (El instanceof Attr) {
    propertyName = "__attrs";
  }

  tree = utils.generateObjectTree(propertyNames, {
    [propertyName]: [El]
  });
  return tree;
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
        ScopedElRefTree = utils.objectAssign(ScopedElRefTree, pluginItem.collectRef(El, RefData));
      }
    }
  }

  Parser.parseRef(ScopedElRefTree, RefData);
  return ScopedElRefTree;
}

function filterHasRefData(refTree, rawData): Record<string, any> {
  refTree = utils.deepCopy(refTree);
  for (const key in refTree) {
    if (Object.prototype.hasOwnProperty.call(refTree, key)) {
      const element = refTree[key];
      if (typeof element === "object" && element) {
        if (element.hasOwnProperty("__els") || element.hasOwnProperty("__attrs")) {
          refTree[key] = rawData[key];
        } else {
          if (rawData) {
            refTree[key] = filterHasRefData(element, rawData[key]);
          }
        }
      } else {
        if (rawData && rawData[key]) {
          refTree[key] = rawData[key];
        }
      }
    }
  }
  return refTree;
}

export default {
  reset,
  collection,
  getProperty,
  getPropertyData,
  generateElRefTree,
  filterHasRefData
};