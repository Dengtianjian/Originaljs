import { TElement, TReferrerElementOGProperties } from "../../Typings/CustomElementTypings";
import { TModuleOptions } from "../../Typings/ModuleTypings";
import { TExpressionInfo, TForElementItem, TRefRecord } from "../../Typings/RefTypings";
import Utils from "../../Utils";
import Err from "../../Utils/Err";
import Expression from "../Expression";
import Parser from "../Parser";
import PropertyProxy from "../PropertyProxy";
import Ref from "../Ref";

function replaceRef(template: string, searchValue: string, replaceValue: string): string {
  template = template.replaceAll(new RegExp(`(?<=\{ *)${searchValue}`, "g"), replaceValue);
  return template;
}

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
      const propertyKeyString: string = propertyKeys.join(".");

      const forTemplate: string = target.innerHTML;
      const expressionInfo: TExpressionInfo = Expression.generateExpressionInfo(refString);
      const refKeyMap: Map<symbol, string[]> = new Map();
      const mapKey: symbol = Symbol(propertyKeys.join());
      refKeyMap.set(mapKey, propertyKeys);

      const refRecord: TRefRecord = Ref.generateRefRecord(propertyKeys, target, mapKey, {
        propertyKeyString: propertyKeys.join(),
        target,
        for: {
          template: forTemplate,
          itemName,
          indexName,
          keyName,
          propertyName: refString,
          els: new Map(),
          propertyKeyString
        },
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
    setProperty(refs, target, propertyKey, value, properties, receiver) {
      if (!refs.__fors) return true;
      const fors: Map<symbol, TForElementItem> = refs.__fors;

      for (const { 1: forItem } of fors) {
        const propertyHTML: string = replaceRef(forItem.for.template, forItem.for.itemName, `${forItem.for.propertyKeyString}[${String(propertyKey)}]`);
        const els = Parser.parseDom(propertyHTML);
        forItem.target.append(...els);
        const refRecord: TRefRecord = Ref.collectRef(els as TElement[], properties, properties.__OG__.reactive);
        Ref.updateRefMap(refRecord, properties);
        Ref.mergeRefMap(refRecord, properties.__OG__.reactive.refMap);
        PropertyProxy.setProxy(refRecord, properties, properties.__OG__.reactive);
      }

      return true;
    },
    updateProperty(refs, target, propertyKey, value, properties, receiver, propertyKeys) {
      if (!refs.__fors || !target.__OG__) return true;
      if (refs.__fors.size === 0 || value.__OG__) return true;
      const propertyKeyString: string = propertyKeys.join();
      const first = refs.__fors.entries().next().value[1];
      if (first.propertyKeyString !== propertyKeyString) return true;

      refs.__fors.forEach(forItem => {
        const property: any = Expression.executeExpression(forItem.expressionInfo, properties);
        let propertyHTML: string = "";
        for (const key in property) {
          propertyHTML += replaceRef(forItem.for.template, forItem.for.itemName, `${forItem.for.propertyKeyString}[${String(key)}]`);
        }
        const els = Parser.parseDom(propertyHTML);
        forItem.target.append(...els);
        const refRecord: TRefRecord = Ref.collectRef(els as TElement[], properties, properties.__OG__.reactive);

        Ref.mergeRefMap(refRecord, properties.__OG__.reactive.refMap);
        PropertyProxy.setProxy(refRecord, properties, properties.__OG__.reactive);
        Ref.updateRefMap(refRecord, properties);
      });
      return true;
    }
  }
} as TModuleOptions