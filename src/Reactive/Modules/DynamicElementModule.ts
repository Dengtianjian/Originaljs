import { ICustomElement, TElement, TReferrerElementOGProperties } from "../../Typings/CustomElementTypings";
import { TModuleOptions } from "../../Typings/ModuleTypings";
import { TDynamicElementBranch, TDynamicElementContentTypes, TExpressionInfo, TRefInfo, TRefRecord, TRefs } from "../../Typings/RefTypings";
import Utils from "../../Utils";
import Expression from "../Expression";
import Parser from "../Parser";
import Ref from "../Ref";

export default {
  reactive: {
    collecElRef(target: TElement, roolEl: ICustomElement): TRefRecord {
      if (target.tagName !== "O-EL") return {};

      const attributes: NamedNodeMap = target.attributes;
      const attr: Attr = attributes['html'] || attributes['value'] || attributes['is'];
      if (!attr) return {};
      const contentType: keyof TDynamicElementContentTypes = attr.nodeName as keyof TDynamicElementContentTypes;
      const attrValue: string = attr.nodeValue;
      let refRecord: TRefRecord = {};
      switch (contentType) {
        case "html":
          if (Ref.isRef(attrValue) === false) {
            //* 不是数据绑定，直渲染
            target.innerHTML = attrValue;
          }
          break;
        case "value":
          if (Ref.isRef(attrValue) === false) {
            //* 不是数据绑定，直渲染
            // target.innerHTML = Parser.optimizeRefKey(attrValue);
            // Utils.objectMerge(refRecord, Ref.collectRef(Array.from(target.childNodes) as TElement[], roolEl, roolEl.__OG__.reactive)); //* 收集元素下的子元素数据绑定依赖
          }
          break;
        case "is":
          if (Ref.isRef(attrValue) === false) {
            const newEl = document.createElement(attrValue.trim());
            target.parentNode.insertBefore(newEl, target);
            target.parentNode.removeChild(target);
          }
          break;
      }
      const refPropertyKeyMap: Map<symbol, string[]> = new Map();
      if (Ref.isRef(attrValue)) {
        const mapKey: symbol = Symbol();
        const expressionInfo: TExpressionInfo = Expression.generateExpressionInfo(attrValue);
        expressionInfo.propertyKeys.forEach(propertyKeyGroup => {
          Utils.objectMerge(refRecord, Ref.generateRefRecord<TDynamicElementBranch>(propertyKeyGroup, target, mapKey, {
            target: attr,
            ownerElement: attr.ownerElement,
            expressionInfo,
            contentType,
            showEl: target,
          }, "__dynamicElements"));
          refPropertyKeyMap.set(mapKey, propertyKeyGroup);
        });
      }

      Utils.defineOGProperty<TReferrerElementOGProperties>(target, {
        skipAttrCollect: true,
        skipChildNodesCollect: true,
        properties: roolEl,
        refs: {
          __dynamicElements: refPropertyKeyMap
        }
      });

      target.removeAttribute(contentType);
      return refRecord;
    },
    updateProperty(refs: TRefs, target: any, propertyKey: string | symbol, value: any, properties: ICustomElement): void {
      if (!refs.__dynamicElements) return;
      const dynamicElements: Map<symbol, TDynamicElementBranch> = refs.__dynamicElements;

      dynamicElements.forEach(dynamicElementInfo => {
        const refPropertyValue: any = Expression.executeExpression(dynamicElementInfo.expressionInfo, properties);
        switch (dynamicElementInfo.contentType) {
          case "html":
            dynamicElementInfo.ownerElement.innerHTML = refPropertyValue;
            break;
          case "value":
            dynamicElementInfo.ownerElement.childNodes.forEach(childNode => {
              Ref.clearElRef(childNode as TElement,properties.__OG__.reactive.refMap);
            });
            dynamicElementInfo.ownerElement.innerHTML = Parser.optimizeRefKey(refPropertyValue);
            const refRecord: TRefRecord = Ref.collectRef(Array.from(dynamicElementInfo.ownerElement.childNodes) as TElement[], properties, properties.__OG__.reactive);

            Ref.updateRefMap(refRecord, properties);
            Ref.mergeRefMap(refRecord,properties.__OG__.reactive.refMap);
            break;
          case "is":
            const newEl: Element = document.createElement(refPropertyValue);
            dynamicElementInfo.showEl.parentNode.insertBefore(newEl, dynamicElementInfo.showEl); //* 插入新的标签
            dynamicElementInfo.showEl.parentNode.removeChild(dynamicElementInfo.showEl); //* 移除旧标签
            dynamicElementInfo.showEl = newEl; //* 现在显示的标签
            break;
        }
      })
    }
  }
} as TModuleOptions