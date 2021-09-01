import { ICustomElement, IElement, TElement } from "../../Typings/CustomElementTypings";
import { TModuleOptions } from "../../Typings/ModuleTypings";
import { TRefTree } from "../../Typings/RefTreeTypings";
import Utils from "../../Utils";
import Ref from "../Ref";
import { MethodRules, RefRules } from "../Rules";
import Transform from "../Transform";

export default {
  reactive: {
    collectAttrRef(target: Attr, properties: ICustomElement): TRefTree {
      if (!target.nodeValue) return {};
      if (RefRules.refItem.test(target.nodeValue) === false) return {};
      if (MethodRules.OnAttributeName.test(target.nodeName)) return {};

      const refTree: TRefTree = Ref.generateRefTreeByRefString(target.nodeValue, target);

      Utils.defineOGProperty(target, {
        attrCollected: true
      });
      Utils.defineOGProperty(target.ownerElement, {
        hasRefs: true
      });
      return refTree;
    },
    setUpdateView(refTree, properties, value): void {
      if (refTree.__attrs === undefined) return;
      const attrs: Attr[] = refTree.__attrs;

      attrs.forEach(attr => {
        attr.nodeValue = Transform.transformObjectToString(value);
      });
    }
  }
} as TModuleOptions