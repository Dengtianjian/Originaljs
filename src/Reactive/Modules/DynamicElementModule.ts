import Reactive from "..";
import { ICustomElement, IElement, TElement, TReferrerElementOGProperties } from "../../Typings/CustomElementTypings";
import { TModuleOptions } from "../../Typings/ModuleTypings";
import { TDynamicElementBranch, TDynamicElementContentTypes, TRefInfo, TRefTree } from "../../Typings/RefTypings";
import Utils from "../../Utils";
import Parser from "../Parser";
import Ref from "../Ref";
import { RefRules } from "../Rules";

export default {
  reactive: {
    collecElRef(target: TElement, roolEl: ICustomElement): TRefTree {
      if (target.tagName !== "O-EL") return {};

      const attributes: NamedNodeMap = target.attributes;
      const attr: Attr = attributes['html'] || attributes['value'] || attributes['is'];
      const contentType: keyof TDynamicElementContentTypes = attr.nodeName as keyof TDynamicElementContentTypes;
      const attrValue: string = attr.nodeValue;
      let refTree: TRefTree = {};
      const endBranch: Record<string, any> = {};
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
            target.innerHTML = Parser.optimizeRefKey(attrValue);
            Reactive.collectEl(Array.from(target.childNodes) as TElement[], roolEl, roolEl.__OG__.reactive); //* 收集元素下的子元素数据绑定依赖
          }
          break;
        case "is":
          endBranch['showEl'] = target;
          break;
      }
      if (Ref.isRef(attrValue)) {
        const branchKey: symbol = Symbol();
        const refInfo: TRefInfo = Ref.parseTemplateGenerateRefInfo(attrValue);
        refTree = Ref.generateRefTreeByRefString(attrValue, attr, branchKey, {
          attr,
          target,
          contentType,
          refInfo,
          ...endBranch
        }, "__dynamicElements");

        const refPropertyKeyMap: Map<symbol, string[] | string[][]> = new Map();
        if (refInfo.type === "expression") {
          refPropertyKeyMap.set(branchKey, refInfo.expressionInfo.refPropertyNames);
        } else {
          refPropertyKeyMap.set(branchKey, refInfo.refPropertyNames);
        }

        Utils.defineOGProperty(target, {
          hasRefs: true,
          refTree: roolEl.__OG__.reactive.refTree,
          refs: {
            "__dynamicElements": refPropertyKeyMap
          }
        } as TReferrerElementOGProperties);
      }

      Utils.defineOGProperty(target, {
        skipAttrCollect: true,
        skipChildNodesCollect: true,
        properties: roolEl
      });

      target.removeAttribute(contentType);
      return refTree;
    },
    setUpdateView(refTree: TRefTree, properties: Record<string, any>) {
      if (refTree?.__dynamicElements === undefined) return;
      const dynamicElements: Map<symbol, TDynamicElementBranch> = refTree.__dynamicElements;

      dynamicElements.forEach(dynamicElementInfo => {
        const refPropertyValue: any = Ref.parenRefInfo(dynamicElementInfo.refInfo, properties.__OG__.properties);
        switch (dynamicElementInfo.contentType) {
          case "html":
            dynamicElementInfo.target.innerHTML = refPropertyValue;
            break;
          case "value":
            dynamicElementInfo.target.childNodes.forEach(childNode => {
              Ref.clearElRef(childNode as TElement, true);
            });
            dynamicElementInfo.target.innerHTML = Parser.optimizeRefKey(refPropertyValue);
            Reactive.collectEl(Array.from(dynamicElementInfo.target.childNodes) as TElement[], properties.__OG__.properties, properties.__OG__.reactive);
            break;
          case "is":
            const newEl: Element = document.createElement(refPropertyValue);
            dynamicElementInfo.showEl.parentNode.insertBefore(newEl, dynamicElementInfo.showEl); //* 插入新的标签
            dynamicElementInfo.showEl.parentNode.removeChild(dynamicElementInfo.showEl); //* 移除旧标签
            dynamicElementInfo.showEl = newEl; //* 现在现在显示的标签
            break;
        }
      })
    },
    // clearRefTree(target: TElement): void {
    //   if (!target.__OG__ || !target.__OG__.ref) return;
    //   const ref = target.__OG__.ref;

    //   if (!ref.info) return;
    //   Ref.clearRefByRefInfo(ref.info, target);
    // }
  }
} as TModuleOptions