import { IEl } from "../../types/ElementType";
import { TPluginItem } from "../../types/Plugin";
import { IProperties } from "../../types/Properties";
import { IRefTree } from "../../types/Ref";
import Utils from "../../Utils";

function updateRef(refTree: IRefTree):void {
  let attrs: Attr[] = refTree.__attrs;
  for (const attrItem of attrs) {
    if (attrItem.ownerElement.tagName !== "O-EL" || attrItem.nodeName !== "html") continue;

    attrItem.ownerElement.innerHTML = attrItem.nodeValue;
  }
}

export default {
  updateRef
} as TPluginItem