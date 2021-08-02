import { IEl } from "../../types/ElementType";
import { TPluginItem } from "../../types/Plugin";
import { IRefTree } from "../../types/Ref";
import Utils from "../../Utils";

function collectElRef(target: IEl | Node[], properties): IRefTree {
  let refTree: IRefTree = {};
  if (Array.isArray(target)) {
    for (const nodeItem of target) {
      Utils.objectAssign(refTree, collectElRef(nodeItem as IEl, properties));
    }
  }

  if ((target as HTMLElement).tagName !== "O-EL") return refTree;
  

  return refTree;
}

export default {
  collectElRef
} as TPluginItem