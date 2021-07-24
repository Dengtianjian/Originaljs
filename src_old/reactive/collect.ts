import { IElement } from "../types/elementType";
import { IPluginItem, IPlugins, TRefTree } from "../types/pluginType";
import Plugin from "../plugin";
import utils from "../utils";
import { IProperties } from "../types/reactiveType";

function getProperty(propertyStrs: string[], properties: IProperties): any {
  let property: any = properties;
  for (const name of propertyStrs) {
    property = property[name];
    if (property === undefined) {
      console.warn(`undefined reactive variables: ${name} . Path:${propertyStrs.join("-> ")}.`);
      break;
    }
  }

  return property;
}
function getPropertyData(propertyStrs: string[], properties: IProperties): any {
  let property: any = getProperty(propertyStrs, properties);
  if (typeof property === "function") {
    property = property();
  }
  return property;
}

function generateElRefTree(propertyNames: string[], El: HTMLElement | Text | Attr): object {
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

function collection(El: IElement, properties: IProperties): TRefTree {
  let ScopedElRefTree = {};

  const Plugins: IPlugins = Plugin.use() as IPlugins;
  for (const plugiName in Plugins) {
    if (Object.prototype.hasOwnProperty.call(Plugins, plugiName)) {
      const pluginItem: IPluginItem = Plugins[plugiName];
      if (pluginItem.collectRef) {
        ScopedElRefTree = utils.objectAssign(ScopedElRefTree, pluginItem.collectRef(El, properties));
      }
    }
  }

  return ScopedElRefTree;
}

function filterHasRefProperties(refTree: TRefTree, properties: IProperties): Record<string, any> {
  refTree = utils.deepCopy(refTree);
  for (const key in refTree) {
    if (Object.prototype.hasOwnProperty.call(refTree, key)) {
      const element = refTree[key];
      if (typeof element === "object" && element) {
        if (element.hasOwnProperty("__els") || element.hasOwnProperty("__attrs")) {
          refTree[key] = properties[key];
        } else {
          if (properties) {
            refTree[key] = filterHasRefProperties(element, properties[key]);
          }
        }
      } else {
        if (properties && properties[key]) {
          refTree[key] = properties[key];
        }
      }
    }
  }
  return refTree;
}

export default {
  collection,
  getProperty,
  getPropertyData,
  generateElRefTree,
  filterHasRefProperties
};