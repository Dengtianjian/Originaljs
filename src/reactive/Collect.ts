import Plugin from "../Plugin";
import { IEl } from "../types/ElementType";
import { TPluginItem, TPlugins } from "../types/Plugin";
import { IProperties } from "../types/Properties";
import { IRefTree } from "../types/Ref";

export function collection(target: IEl, properties: IProperties): IRefTree {
  let elRefTree: IRefTree = {};

  const Plugins: TPlugins = Plugin.all();
  for (const pluginName in Plugins) {
    if (Object.prototype.hasOwnProperty.call(Plugins, pluginName)) {
      const pluginItem: TPluginItem = Plugins[pluginName];
      if (pluginItem.collectRef) {
        elRefTree = utils.objectAssign(elRefTree, pluginItem.collectRef(target, properties));
      }
    }
  }

  return elRefTree;
}

export default {
  collection
}