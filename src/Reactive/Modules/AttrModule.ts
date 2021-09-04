import { ICustomElement, IElement, TElement } from "../../Typings/CustomElementTypings";
import { TModuleOptions } from "../../Typings/ModuleTypings";
import { TRefTree } from "../../Typings/RefTreeTypings";
import Utils from "../../Utils";
import Expression from "../Expression";
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
      const propertyNames: string[] = Ref.collecRef(target.nodeValue, true)[0] as string[];

      Utils.defineOGProperty(target, {
        attrCollected: true,
        properties,
        ref: {
          branchKey,
          propertyNames
        }
      });
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
    clearAttrRefTree(target: Attr & { [key: string]: any } & TElement): void {
      if (!target.__OG__) return;
      const ref = target.__OG__.ref;

      const branch: TRefTree = Utils.getObjectProperty(target.__OG__.properties.__OG__.refTree, ref.propertyNames);
      if (!branch.__attrs) return;
      branch.__attrs.delete(ref.branchKey);
    }
  }
} as TModuleOptions