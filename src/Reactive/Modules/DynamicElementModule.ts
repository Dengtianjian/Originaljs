import Reactive from "..";
import { ICustomElement, IElement, TElement } from "../../Typings/CustomElementTypings";
import { TModuleOptions } from "../../Typings/ModuleTypings";
import { TDynamicElementBranch, TDynamicElementContentTypes, TRefTree } from "../../Typings/RefTreeTypings";
import Utils from "../../Utils";
import Parser from "../Parser";
import Ref from "../Ref";
import { RefRules } from "../Rules";

export default {
  reactive: {
    collecElRef(target: TElement): TRefTree {
      if (target.tagName !== "O-EL") return {};

      const attributes: NamedNodeMap = target.attributes;
      const attr: Attr = attributes['html'] || attributes['value'] || attributes['is'];
      const contentType: keyof TDynamicElementContentTypes = attr.nodeName as keyof TDynamicElementContentTypes;
      const attrValue: string = attr.nodeValue;
      let refTree: TRefTree = {};
      if (contentType === "html") {
        if (RefRules.matchRefItem.test(attrValue)) {
          refTree = Ref.generateRefTreeByRefString(attrValue, attr, [{
            attr,
            target,
            contentType,
            refInfo: Ref.generateRefInfo(attrValue)
          }], "__dynamicElements");
        } else {
          target.innerHTML = attrValue;
        }
      } else if (contentType === "value") {
        refTree = Ref.generateRefTreeByRefString(attrValue, attr, [{
          attr,
          target,
          contentType,
          refInfo: Ref.generateRefInfo(attrValue)
        }], "__dynamicElements");
      } else if (contentType === "is") {
        console.log(attributes['is']);
      }

      Utils.defineOGProperty(target, {
        skipAttrCollect: true,
        skipChildNodesCollect: true
      });

      return refTree;
    },
    setUpdateView(refTree: TRefTree, properties: Record<string, any>, value) {
      if (refTree?.__dynamicElements === undefined) return;
      const dynamicElements: TDynamicElementBranch[] = refTree.__dynamicElements;

      dynamicElements.forEach(dynamicElementInfo => {
        switch (dynamicElementInfo.contentType) {
          case "html":
            dynamicElementInfo.target.innerHTML = Ref.handleRefInfo(dynamicElementInfo.refInfo, properties.__OG__.properties);
            break;
          case "value":
            let html: string = Ref.handleRefInfo(dynamicElementInfo.refInfo, properties.__OG__.properties);
            dynamicElementInfo.target.innerHTML = Parser.optimizeRefKey(html);
            Reactive.collectEl(Array.from(dynamicElementInfo.target.childNodes) as TElement[], properties.__OG__.properties, properties.__OG__.reactive);
            break;
        }
      })
    }
  }
} as TModuleOptions