import Reactive from "..";
import { ICustomElement, IElement, TElement, TReferrerElementOGProperties } from "../../Typings/CustomElementTypings";
import { TModuleOptions } from "../../Typings/ModuleTypings";
import { TForElementItem, TRefInfo, TRefTree } from "../../Typings/RefTypings";
import Utils from "../../Utils";
import Err from "../../Utils/Err";
import Ref from "../Ref";
import Transform from "../Transform";
import Parser from "../Parser";
import Expression from "../Expression";

function replaceRef(template: string, searchValue: string, replaceValue: string): string {
  template = template.replaceAll(new RegExp(`\{ *${searchValue} *\}`, "g"), replaceValue);
  return template;
}

export default {
  reactive: {
    collecElRef(target: IElement, rootEl: ICustomElement): TRefTree {
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
      if (Expression.isExpression(refString)) {
        Err.throwError("The for element in attribute does nont support expressions");
      }
      target.removeAttribute("in");
      const refs: string[] = Ref.collecRef(refString, false) as string[];

      const forTemplate: string = target.innerHTML.trim();
      const refInfo: TRefInfo = Ref.parseTemplateGenerateRefInfo(refString);
      const branchKey: symbol = Symbol("refString");
      const refTree: TRefTree = Ref.generateRefTreeByRefString(refString, target, branchKey, {
        target,
        for: {
          itemName,
          indexName,
          keyName,
          template: forTemplate,
          propertyNames: refs,
          els: new Map()
        },
        refs: refInfo
      }, "__fors");
      const refPropertyKeyMap: Map<symbol, string[] | string[][]> = new Map();
      if (refInfo.type === "expression") {
        refPropertyKeyMap.set(branchKey, refInfo.expressionInfo.refPropertyNames);
      } else {
        refPropertyKeyMap.set(branchKey, refInfo.refPropertyNames);
      }

      Utils.defineOGProperty(target, {
        properties: rootEl,
        skipAttrCollect: true,
        skipChildNodesCollect: true,
        refMap: refTree,
        refs: {
          __fors: refPropertyKeyMap
        }
      } as TReferrerElementOGProperties);

      target.innerHTML = "";
      return refTree;
    },
    setUpdateView(refTree, value, properties: ICustomElement): boolean {
      if (!refTree || !refTree.__fors) return true;
      if (typeof value !== "object") return false;
      const fors: Map<symbol, TForElementItem> = refTree.__fors;

      fors.forEach(forItem => {
        const proeprtyValue: any = Ref.parenRefInfo(forItem.refs, properties, false);

        const containerEl = document.createElement("div");
        for (let index = 0; index < proeprtyValue.length; index++) {
          if (forItem.for.els.get(String(index))) continue;
          const appendHTML = replaceRef(forItem.for.template, forItem.for.itemName, `{${forItem.for.propertyNames[0]}[${index}]}`);
          containerEl.append(...Parser.parseDom(appendHTML));
          forItem.for.els.set(String(index), containerEl.childNodes.item(containerEl.childNodes.length - 1));
        }

        // @ts-ignore
        Reactive.collectEl(containerEl, properties, properties.__OG__.reactive);
        forItem.target.append(...Array.from(containerEl.childNodes));
      });

      return true;
    }
  }
} as TModuleOptions