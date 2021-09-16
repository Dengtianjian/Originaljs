import { TReferrerElementOGProperties } from "../../Typings/CustomElementTypings";
import { TModuleOptions } from "../../Typings/ModuleTypings";
import { TExpressionInfo, TRefRecord } from "../../Typings/RefTypings";
import Utils from "../../Utils";
import Err from "../../Utils/Err";
import Expression from "../Expression";
import Ref from "../Ref";

export default {
  reactive: {
    collecElRef(target, properties): TRefRecord {
      if (target.tagName !== "O-FOR") return {};
      if (!target.attributes['in']) {
        Err.throwError("For element requires in attribute");
      }

      const attributes: NamedNodeMap = target.attributes;
      let itemName: string = null;
      if (attributes[0] && attributes[0].nodeName !== "in") {
        itemName = attributes[0].nodeName;
        target.removeAttribute(itemName);
      }
      let indexName: string = null;
      if (attributes[1] && attributes[1].nodeName !== "in") {
        indexName = attributes[1].nodeName;
        target.removeAttribute(indexName);
      }
      let keyName: string = !attributes[2] || attributes[2].nodeName === 'in' ? null : attributes[2].nodeName;
      if (attributes[2] && attributes[2].nodeName !== "in") {
        keyName = attributes[2].nodeName;
        target.removeAttribute(keyName);
      }
      const refString: string = attributes['in'].nodeValue;
      target.removeAttribute("in");

      let refs: string[] | string[][] = Ref.getRefPropertyKey(refString);
      if (refs.length > 1) {
        Err.throwError("The for element 'in' attribute value only one variable is allowed");
      }
      const propertyKeys: string[] = refs[0] as string[];

      const forTemplate: string = target.innerHTML;
      const expressionInfo: TExpressionInfo = Expression.generateExpressionInfo(refString);
      const refKeyMap: Map<symbol, string[]> = new Map();
      const mapKey: symbol = Symbol(propertyKeys.join());
      refKeyMap.set(mapKey, propertyKeys);
      const refRecord: TRefRecord = Ref.generateRefRecord(propertyKeys, target, mapKey, {
        forTemplate,
        target,
        expressionInfo
      }, "__fors");

      Utils.defineOGProperty<TReferrerElementOGProperties>(target, {
        skipAttrCollect: true,
        skipChildNodeCollect: true,
        properties,
        refMap: refKeyMap,
        refs: {
          "__fors": refKeyMap
        }
      });
      target.innerHTML = "";

      return refRecord;
    },
    setUpdateView(refs, target) {
      console.trace(target);
      
      return true;
    }
  }
} as TModuleOptions