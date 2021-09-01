import { ICustomElement, IElement, TElement } from "../../Typings/CustomElementTypings";
import { TModuleOptions } from "../../Typings/ModuleTypings";
import { TDynamicElementBranch, TDynamicElementContentTypes, TRefTree } from "../../Typings/RefTreeTypings";
import Utils from "../../Utils";
import Expression from "../Expression";
import Ref from "../Ref";
import { RefRules } from "../Rules";

export default {
  reactive: {
    collecElRef(target: TElement, rootEl: ICustomElement): TRefTree {
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
            rawTemplate: attrValue,
            contentType
          }], "__dynamicElements");
        } else {
          target.innerHTML = attrValue;
        }
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
      if (!refTree.__dynamicElements) return;
      const dynamicElements: TDynamicElementBranch[] = refTree.__dynamicElements;

      dynamicElements.forEach(dynamicElementInfo => {
        switch (dynamicElementInfo.contentType) {
          case "html":
            dynamicElementInfo.target.innerHTML = Expression.executeExpression(dynamicElementInfo.rawTemplate, properties.__OG__.properties);
            break;

        }
      })


    }
  }
} as TModuleOptions