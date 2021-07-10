import Reactive from ".";
import { IPlugins, TPropertys, TRefTree } from "../types/pluginType";
import { IReactiveItem } from "../types/reactiveType";
import collect from "./collect";
import Plugin from "../plugin";
import parser from "./parser";
import { ExtractVariableName } from "./rules";
import utils from "../utils";

export function updateRef(refTree: TPropertys, value: any, rawData?: {}) {
  if (typeof value !== "string") {
    value = value.toString();
  }

  if (refTree.__els) {
    const els: HTMLElement[] = refTree['__els'];

    els.forEach(el => {
      el.textContent = value;
    });
  }

  if (refTree.__attrs) {
    const attrs: Attr[] = refTree['__attrs'];
    attrs.forEach(attr => {
      if (attr.__og_attrs) {
        attr.nodeValue = parser.parseString(attr.__og_attrs.rawNodeValue, rawData);
      } else {
        attr.nodeValue = value;
      }
    });
  }
}

export function updateTargetView(refTree: TPropertys, rawData: {}): Boolean {
  for (const key in refTree) {
    if (Object.prototype.hasOwnProperty.call(refTree, key) && !['__attrs', "__els"].includes(key)) {

      if (typeof refTree[key] === "object") {
        updateTargetView(refTree[key], rawData[key]);
      }

      updateRef(refTree[key], rawData[key].toString());
    }
  }
  return true;
}

export function setUpdateView(target: IReactiveItem, propertyKey: PropertyKey, value: any, receiver?: any) {
  const refs = target.__og_root['refs'];
  const propertyNames: string[] = parser.parseRefString(target.__og_stateKey);
  const propertys: TPropertys = utils.deepGetObjectProperty(refs, propertyNames)

  const plugins: IPlugins = Plugin.use() as IPlugins;
  for (const pluginName in plugins) {
    if (Object.prototype.hasOwnProperty.call(plugins, pluginName)) {
      const pluginItem = plugins[pluginName];
      if (pluginItem.setUpdateView) {
        pluginItem.setUpdateView(target, propertys, propertyKey, value, target.__og_root.data);
      }
    }
  }
}

export function deleteUpdateView(target: IReactiveItem, propertyKey: PropertyKey) {
  const propertyNames: string[] = parser.parseRefString(target.__og_stateKey);
  const refs: TRefTree = utils.deepGetObjectProperty(target.__og_root['refs'], propertyNames)

  const plugins: IPlugins = Plugin.use() as IPlugins;
  for (const pluginName in plugins) {
    if (Object.prototype.hasOwnProperty.call(plugins, pluginName)) {
      const pluginItem = plugins[pluginName];
      if (pluginItem.deleteUpdateView) {
        pluginItem.deleteUpdateView(target, refs, propertyKey);
      }
    }
  }
}

export default {
  updateTargetView,
  setUpdateView,
  deleteUpdateView
}