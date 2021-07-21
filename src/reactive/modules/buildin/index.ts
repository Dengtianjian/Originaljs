import { IEl } from "../../../types/ElementType";
import { TPluginItem } from "../../../types/Plugin";
import { IProperties } from "../../../types/Properties";
import { IRefTree } from "../../../types/Ref";
import Utils from "../../../Utils";
import { handleOFor } from "./ofor";

const buildInTagName: string[] = ["o-for", "o-if"];



function collectRef(target: IEl, properties: IProperties): IRefTree {
  if (target.nodeType === 3 || target.__og__tagCollected) return {};

  let refTree = {};
  if (target.nodeType === 1 && buildInTagName.includes((target as HTMLElement).tagName.toLowerCase())) {
    switch ((target as HTMLElement).tagName.toLowerCase()) {
      case "o-for":
        refTree = Utils.objectAssign(refTree, handleOFor(target as HTMLElement, properties));
        break;
    }
  }

  if (target.childNodes.length > 0) {
    for (const key in target.childNodes) {
      if (target.childNodes.hasOwnProperty(key)) {
        refTree = Utils.objectAssign(refTree, collectRef(target.childNodes[key] as IEl, properties));
      }
    }
  }

  return refTree;
}

export default {
  collectRef
} as TPluginItem