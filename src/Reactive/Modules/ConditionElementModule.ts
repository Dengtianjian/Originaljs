import { TConditionElItem } from "../../Typings/ConditionElementTypings";
import { TElement } from "../../Typings/CustomElementTypings";
import { TModuleOptions } from "../../Typings/ModuleTypings";
import { TRefTree } from "../../Typings/RefTypings";
import Utils from "../../Utils";
import Err from "../../Utils/Err";
const ConditionElTagNames: string[] = ["O-IF", "O-ELSE", "O-ELSE-IF"];

function getConditionElSibling(target: TElement | Element): TConditionElItem[] {
  const els: TConditionElItem[] = [{
    target,
    conditionAttr: target.attributes['condition'],
    shadow: new Comment(target.nodeName),
    parentNode: target.parentNode
  }];


  if (target.tagName !== "O-ELSE") {
    if (!target.attributes['condition']) {
      Err.throwError("Condition element is missing condition attribute");
    }
    if (target.nextElementSibling) {
      els.push(...getConditionElSibling(target.nextElementSibling));
    }
  }
  Utils.defineOGProperty(target, {
    conditionElementCollected: true
  });

  return els;
}

export default {
  reactive: {
    collecElRef(target: TElement | TElement[]): TRefTree {
      const refTree: TRefTree = {};
      if (Array.isArray(target)) {
        target.forEach(elItem => {
          Utils.objectMerge(refTree, this.collectElRef(elItem));
        })
        return refTree;
      }

      if (target.nodeType !== 1 || !ConditionElTagNames.includes(target.tagName)) {
        return refTree;
      }
      if (["O-ELSE-IF", "O-ELSE"].includes(target.tagName)) {
        if (!target.__OG__.conditionElementCollected) {
          Err.throwError("o-if element is required be fore o-else-if or o-else element");
        }
      }
      if (target.tagName !== "O-IF") return {};
      if (!target.attributes['condition']) {
        Err.throwError("Condition element is missing condition attribute");
      }

      const els: TConditionElItem[] = getConditionElSibling(target);
      console.log(els);


      return refTree;
    }
  }
} as TModuleOptions