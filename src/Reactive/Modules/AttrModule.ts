import { ICustomElement, TAttr, TReferrerElement, TReferrerElementOGProperties, TReferrerRefInfo } from "../../Typings/CustomElementTypings";
import { TModuleOptions } from "../../Typings/ModuleTypings";
import { TRefTree } from "../../Typings/RefTypings";
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
      if (!Ref.isRef(target.nodeValue)) return {};

      const branchKey: symbol = Symbol();
      const refTree: TRefTree = Ref.generateRefTreeByRefString(target.nodeValue, target, branchKey);
      const propertyKeyMap: Map<symbol, string[] | string[][]> = new Map();
      propertyKeyMap.set(branchKey, Ref.collecRef(target.nodeValue, true)[0] as string[]);

      Utils.defineOGProperty(target.ownerElement, {
        refs: {
          "__attrs": propertyKeyMap
        }
      } as TReferrerElementOGProperties);
      Utils.defineOGProperty(target.ownerElement, {
        hasRefs: true
      });
      return refTree;
    },
    setUpdateView(refTree, properties, value): void {
      if (refTree?.__attrs === undefined) return;

      refTree.__attrs.forEach(attr => {
        attr.nodeValue = Transform.transformObjectToString(value);
      });
    },
    clearAttrRefTree(target: TReferrerElement): void {
      // if (!target.__OG__||!target.__OG__.refs) return;
      // Ref.removeRefByRefererRefInfo(target.__OG__.refs, target.__OG__.refTree);
    }
  }
} as TModuleOptions