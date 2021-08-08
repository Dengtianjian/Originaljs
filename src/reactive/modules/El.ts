import { TPluginItem } from "../../types/Plugin";
import { IRefTree, TAttr } from "../../types/Ref";
import Utils from "../../Utils";
import { removeTargetRefTree } from "../../View";
import Reactive from "../index";

function objectAssign(target: object, source: object) {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const targetItem = target[key];
      const sourceItem = source[key];

      if (typeof targetItem === "object") {
        if (Array.isArray(targetItem)) {
          target[key].push(...sourceItem);
        } else {
          objectAssign(targetItem, sourceItem);
        }
      } else {
        target[key] = source[key];
      }
    }
  }
}

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
      let refTree = Reactive.collectEl(attrItem.ownerElement, properties, properties.__og__.reactive);
      if (properties.__og__.refTree.number) {
        properties.__og__.refTree.number.a = [];
      }

      Utils.objectAssign(properties.__og__.refTree, refTree);
    }
  }
}

export default {
  updateRef
} as TPluginItem