import Module from "../../Module";
import { ICustomElement, TAttr, TReferrerElement, TReferrerElementOGProperties, TReferrerRefInfo } from "../../Typings/CustomElementTypings";
import { TModuleOptions } from "../../Typings/ModuleTypings";
import { TRefRecord, TRefTree } from "../../Typings/RefTypings";
import Utils from "../../Utils";
import Expression from "../Expression";
import Ref from "../Ref";
import { MethodRules, RefRules } from "../Rules";
import Transform from "../Transform";

export default {
  reactive: {
    collectAttrRef(target: Attr): TRefTree {
      if (!target.nodeValue) return {};
      if (RefRules.refItem.test(target.nodeValue) === false) return {};
      if (MethodRules.OnAttributeName.test(target.nodeName)) return {};
      if (!Ref.isRef(target.nodeValue)) return {};

      const mapKey: symbol = Symbol();
      const refRecord: TRefRecord = Ref.generateRefRecords(target, mapKey);
      const refKeyMap: Map<symbol, string[]> = new Map();
      for (const propertyKeyString in refRecord) {
        refKeyMap.set(mapKey, Transform.transformPropertyKeyToArray(propertyKeyString));
      }

      Utils.defineOGProperty<TReferrerElementOGProperties>(target.ownerElement, {
        refs: {
          "__attrs": refKeyMap
        },
      });
      return refRecord;
    },
    updateProperty(refs, target, propertyKey, value, properties): void {
      if (refs?.__attrs === undefined) return;

      refs.__attrs.forEach(attr => {
        Module.useAll("reactive.beforeUpdateAttrView", [attr, attr.target.nodeValue, properties, refs]);
        // @ts-ignore 可以存放number类型的
        attr.target.textContent = Transform.transformObjectToString(Expression.executeExpression(attr.expressionInfo, properties));
        Module.useAll("reactive.afterUpdateAttrView", [attr, value, properties, refs]);
      });
    },
  }
} as TModuleOptions