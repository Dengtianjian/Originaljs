import { ICustomElement, IElement, TElement } from "../../Typings/CustomElementTypings";
import { TModuleOptions } from "../../Typings/ModuleTypings";
import { TRefTree } from "../../Typings/RefTreeTypings";
import Utils from "../../Utils";
import Ref from "../Ref";
import { RefRules } from "../Rules";

export default {
  reactive: {
    collectAttrRef(target: Attr, properties: ICustomElement): TRefTree {
      if (!target.nodeValue) return {};
      if (RefRules.refItem.test(target.nodeValue) === false) return {};

      const refs: string[] = Ref.getRefKey(target.nodeValue, false);
      if (refs.length === 0) return {};

      const nodeValue: string = target.nodeValue;
      const ownElement: TElement = target.ownerElement as TElement;

      Utils.defineOGProperty(target, {
        attrCollected: true
      });

      refs.forEach(refItem=>{

      })

      console.dir(nodeValue)
    }
  }
} as TModuleOptions