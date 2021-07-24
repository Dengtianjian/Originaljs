import { IEl } from "../../../types/ElementType";
import { TPluginItem } from "../../../types/Plugin";
import { IProperties } from "../../../types/Properties";
import { IRefTree } from "../../../types/Ref";
import Utils from "../../../Utils";
import { handleOFor, oForElUpdateView } from "./ofor";

const buildInTagName: string[] = ["o-for", "o-if"];

function collectRef(target: IEl | Node[], properties: IProperties): IRefTree {
  let refTree = {};

  if (Array.isArray(target)) {
    for (const node of target) {
      Utils.objectAssign(refTree, collectRef(node as IEl, properties));
    }
    return refTree;
  }

  if (target.nodeType === 3 || target.__og__tagCollected) return {};

  console.time();
  if (target.nodeType === 1 && buildInTagName.includes((target as HTMLElement).tagName.toLowerCase())) {
    switch ((target as HTMLElement).tagName.toLowerCase()) {
      case "o-for":
        Utils.objectAssign(refTree, handleOFor(target as HTMLElement, properties));
        break;
    }
  }

  if (target.childNodes.length > 0) {
    for (const key in target.childNodes) {
      if (target.childNodes.hasOwnProperty(key)) {
        Utils.objectAssign(refTree, collectRef(target.childNodes[key] as IEl, properties));
      }
    }
  }
  console.timeEnd();
  console.log(refTree);
  

  return refTree;
}

function setUpdateView(properties: IProperties, refTree: IRefTree, propertyKey: string, value: any): boolean {
  if (refTree.hasOwnProperty("__fors")) {
    return oForElUpdateView(properties, refTree, propertyKey, value);
  }
  return true;
}

export default {
  collectRef,
  setUpdateView
} as TPluginItem