import { TPluginItem } from "../../types/Plugin";
import { IRefTree, TAttr, TText } from "../../types/Ref";
import Utils, { deepCopy, defineOGProperty } from "../../Utils";
import { removeTargetRefTree } from "../../View";
import Reactive from "../index";

function updateRef(refTree: IRefTree, properties): void {
  if (!refTree.__attrs) return;
  let attrs: TAttr[] = refTree.__attrs;

  for (const attrItem of attrs) {
    if (attrItem.ownerElement.tagName !== "O-EL") continue;

    if (attrItem.nodeName === "html") {
      attrItem.ownerElement.innerHTML = attrItem.nodeValue;
    } else if (attrItem.nodeName === "value") {
      removeTargetRefTree(attrItem.ownerElement, true);
      attrItem.ownerElement.innerHTML = attrItem.nodeValue;

      let refTree:IRefTree = Reactive.collectEl(attrItem.ownerElement, properties, properties.__og__.reactive);
      for (const branchName in refTree) {
        if (refTree.hasOwnProperty(branchName)) {
          const branch: IRefTree = refTree[branchName];
          const els: TText[] = branch.__els;
          const attrs: TAttr[] = branch.__attrs;
  
          if (els) {
            for (let index = 0; index < els.length; index++) {
              const elItem = els[index];
              defineOGProperty(elItem, {
                ref: {
                  branch,
                  parentBranch: refTree,
                  branchName,
                  propertyKey: index
                }
              });
            }
          }
        }
      }
    }
  }
}

export default {
  updateRef
} as TPluginItem