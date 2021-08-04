import Plugin from "../../Plugin";
import { IEl } from "../../types/ElementType";
import { TPluginItem } from "../../types/Plugin";
import { IProperties } from "../../types/Properties";
import { IRefTree } from "../../types/Ref";
import Utils from "../../Utils";
import Collect from "../Collect";
import Reactive from "../index";

function updateRef(refTree: IRefTree, properties): void {
  if (!refTree.__attrs) return;
  let attrs: Attr[] = refTree.__attrs;
  for (const attrItem of attrs) {
    if (attrItem.ownerElement.tagName !== "O-EL") continue;

    if (attrItem.nodeName === "html") {
      attrItem.ownerElement.innerHTML = attrItem.nodeValue;
    } else if (attrItem.nodeName === "value") {
      attrItem.ownerElement.innerHTML = attrItem.nodeValue;
      Utils.objectAssign(properties.__og__reactive.refTree,Reactive.collectEl(attrItem.ownerElement, properties, properties.__og__reactive));
    }
  }
}

export default {
  updateRef
} as TPluginItem