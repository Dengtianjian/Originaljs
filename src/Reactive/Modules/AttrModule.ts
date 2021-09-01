import { ICustomElement, IElement, TElement } from "../../Typings/CustomElementTypings";
import { TModuleOptions } from "../../Typings/ModuleTypings";
import { TRefTree } from "../../Typings/RefTreeTypings";
import Utils from "../../Utils";
import Ref from "../Ref";
import { RefRules } from "../Rules";
import Transform from "../Transform";

export default {
  reactive: {
    collectAttrRef(target: Attr, properties: ICustomElement): TRefTree {
      if (!target.nodeValue) return {};
      if (RefRules.refItem.test(target.nodeValue) === false) return {};

      const refs: string[] = Ref.getRefKey(target.nodeValue, false);
      if (refs.length === 0) return {};

      Utils.defineOGProperty(target, {
        attrCollected: true
      });

      const refTree: TRefTree = {};
      refs.forEach(refItem => {
        const refPropertyNames: string[][] | string[] = Ref.collecRef(refItem);

        refPropertyNames.forEach(propertyNames => {
          Utils.objectMerge(refTree, Ref.generateRefTree(propertyNames, target));
        });

      });

      Utils.defineOGProperty(target.ownerElement, {
        hasRefs: true
      });
      return refTree;
    },
    setUpdateView(refTree, properties, value): void {
      if (!refTree.__attrs) return;
      const attrs: Attr[] = refTree.__attrs;

      attrs.forEach(attr => {
        attr.nodeValue = Transform.transformObjectToString(value);
      });
    }
  }
} as TModuleOptions