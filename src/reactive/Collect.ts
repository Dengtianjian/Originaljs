import Plugin from "../Plugin";
import { IEl } from "../types/ElementType";
import { TPluginItem, TPlugins } from "../types/Plugin";
import { IProperties } from "../types/Properties";
import { IRefTree } from "../types/Ref";
import Utils from "../Utils";

export function collection(target: IEl, properties: IProperties): IRefTree {
  let elRefTree: IRefTree = {};

  const Plugins: TPlugins = Plugin.all();
  for (const pluginName in Plugins) {
    if (Object.prototype.hasOwnProperty.call(Plugins, pluginName)) {
      const pluginItem: TPluginItem = Plugins[pluginName];
      if (pluginItem.collectRef) {
        elRefTree = Utils.objectAssign(elRefTree, pluginItem.collectRef(target, properties));
      }
    }
  }

  return elRefTree;
}

export function generateElRefTree(propertyNames: string[], refEl: Attr | Text): IRefTree {
  let tree: IRefTree = {};

  let branchName: string = "__els";
  if (refEl instanceof Attr) {
    branchName = "__attrs";
  }
  tree = Utils.generateObjectTree(propertyNames, {
    [branchName]: [refEl]
  });

  return tree;
}

export default {
  collection,
  generateElRefTree
}