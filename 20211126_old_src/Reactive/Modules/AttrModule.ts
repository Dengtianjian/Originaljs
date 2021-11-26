import Module from "../../Module";
import { ICustomElement, TAttr, TElement, TReferrerElement, TReferrerElementOGProperties, TReferrerRefInfo } from "../../Typings/CustomElementTypings";
import { TModuleOptions } from "../../Typings/ModuleTypings";
import { TExpressionInfo, TRefRecord } from "../../Typings/RefTypings";
import Utils from "../../Utils";
import Expression from "../Expression";
import Ref from "../Ref";
import { MethodRules, RefRules } from "../Rules";
import Transform from "../Transform";

export default {
  reactive: {
    collectAttrRef(target: Attr): TRefRecord {
      if (!target.nodeValue) return {};
      if (RefRules.refItem.test(target.nodeValue) === false) return {};
      if (MethodRules.OnAttributeName.test(target.nodeName)) return {};
      if (!Ref.hasRef(target.nodeValue)) return {};

      const refRecord: TRefRecord = {};
      const mapKey: symbol = Symbol();
      const expressions: string[] = Ref.getExpression(target.textContent, false);
      const expressionInfos: Record<string, TExpressionInfo> = {};
      if (expressions.length === 0) return {};
      expressions.forEach(expressionItem => {
        const propertyKeys: string[][] = Ref.getRefPropertyKey(expressionItem, true, true) as string[][];
        expressionInfos[expressionItem] = Expression.generateExpressionInfo(expressionItem);
        propertyKeys.forEach(propertyKeyGroup => {
          Utils.objectMerge(refRecord, Ref.generateRefRecord(propertyKeyGroup, target, mapKey, {
            expressionInfos
          }));
        })
      })

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
        Module.useAll("reactive.beforeUpdateAttrView", [attr.target, attr.target.nodeValue, properties, refs]);
        let replaceTextContent: string = attr.textContent;
        for (const expressionRawString in attr.expressionInfos) {
          const expressionItem: TExpressionInfo = attr.expressionInfos[expressionRawString];
          const result = Expression.executeExpression(expressionItem, properties);
          if ((attr.target.ownerElement as TElement).__OG__ && (attr.target.ownerElement as TElement).__OG__.OGElement) {
            attr.target.ownerElement[attr.target.nodeName] = result;
          } else {
            // @ts-ignore 可以存放number类型的
            replaceTextContent = replaceTextContent.replace(expressionRawString, Transform.transformObjectToString(result));
          }
        }
        if (replaceTextContent !== attr.target.textContent) {
          attr.target.textContent = replaceTextContent;
        }
        Module.useAll("reactive.afterUpdateAttrView", [attr.target, value, properties, refs]);
      });
    },
  }
} as TModuleOptions