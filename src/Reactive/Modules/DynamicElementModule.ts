import { ICustomElement, IElement } from "../../Typings/CustomElementTypings";
import { TModuleOptions } from "../../Typings/ModuleTypings";
import { TRefTree } from "../../Typings/RefTreeTypings";
import Utils from "../../Utils";

export default {
  reactive: {
    collectAttrRef(target: Attr, rootEl: ICustomElement): TRefTree {
      if (target.ownerElement && target.ownerElement.tagName !== "O-EL") return {};
      const refTree: TRefTree = {};

      if(target.nodeName){

      }

      return refTree;
    }
  }
} as TModuleOptions