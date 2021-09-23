import { TConditionElItem, TConditionItem } from "../../Typings/ConditionElementTypings";
import { ICustomElement, TElement } from "../../Typings/CustomElementTypings";
import { TModuleOptions } from "../../Typings/ModuleTypings";
import { TExpressionInfo, TRefRecord, TRefTree } from "../../Typings/RefTypings";
import Utils from "../../Utils";
import Err from "../../Utils/Err";
import Ref from "../Ref";
import Expression from "../Expression";
const ConditionElTagNames: string[] = ["O-IF", "O-ELSE", "O-ELSE-IF"];
const Conditions: Map<symbol, TConditionItem> = new Map();

function getConditionElSibling(target: TElement | Element): TConditionElItem[] {
  let expressionInfo: TExpressionInfo = null;
  if (target.attributes['condition']) {
    expressionInfo = Expression.generateExpressionInfo(target.attributes['condition'].nodeValue);
  }
  const els: TConditionElItem[] = [{
    target: target as TElement,
    conditionAttr: target.attributes['condition'],
    shadow: new Comment(target.nodeName),
    expressionInfo
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
    skipChildNodeCollect: true,
    conditionElementCollected: true
  });

  return els;
}

export default {
  reactive: {
    collecElRef(target: TElement, rootEl: ICustomElement): TRefTree {
      if (target.nodeType !== 1 || !ConditionElTagNames.includes(target.tagName)) {
        return {};
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

      const parentNode: ParentNode = target.parentNode;
      const els: TConditionElItem[] = getConditionElSibling(target);
      const conditionKey: symbol = Symbol();
      Conditions.set(conditionKey, {
        els,
        current: null,
        parentNode
      });

      for (const elItem of els) {
        Utils.defineOGProperty(elItem.target, {
          skipChildNodesCollect: true,
          refMap: rootEl.__OG__.reactive.refMap,
          condition: {
            conditionKey,
            template: elItem.target.innerHTML,
          }
        });
        if (parentNode.contains(elItem.target)) {
          parentNode.insertBefore(elItem.shadow, elItem.target);
          parentNode.removeChild(elItem.target);
        } else {
          parentNode.appendChild(elItem.shadow);
        }
      }

      return {};
    },
    afterUpdateAttrView(attr, nodeValue, properties, refTree): void {
      if (!['O-IF', 'O-ELSE-IF'].includes(attr.ownerElement.tagName)) return;

      const ownerElement: TElement = attr.ownerElement as TElement;
      const conditionItem: TConditionItem = Conditions.get(ownerElement.__OG__.condition.conditionKey);

      let showIndex: number = conditionItem.current;
      for (let index = 0; index < conditionItem.els.length; index++) {
        const conditionElItem = conditionItem.els[index];
        if (conditionElItem.conditionAttr) {
          const expressionResult: boolean = Boolean(Expression.executeExpression(conditionElItem.expressionInfo, properties));

          if (expressionResult === true) {
            showIndex = index;
            break;
          }
        } else if (conditionElItem.target.tagName === "O-ELSE") {
          showIndex = index;
          break;
        }
      }

      if (showIndex === conditionItem.current) return;

      if (conditionItem.current !== null) {
        const oldConditionEl: TConditionElItem = conditionItem.els[conditionItem.current];
        if (conditionItem.parentNode.contains(oldConditionEl.target)) {
          conditionItem.parentNode.insertBefore(oldConditionEl.shadow, oldConditionEl.target);
          conditionItem.parentNode.removeChild(oldConditionEl.target);
        }
        oldConditionEl.target.childNodes.forEach(childNode => {
          Ref.clearElRef(childNode as TElement, properties.__OG__.reactive.refMap);
        })
      }

      const showConditionEl: TConditionElItem = conditionItem.els[showIndex];
      if (conditionItem.parentNode.contains(showConditionEl.shadow)) {
        showConditionEl.target.innerHTML = showConditionEl.target.__OG__.condition.template
        conditionItem.parentNode.insertBefore(showConditionEl.target, showConditionEl.shadow);
        conditionItem.parentNode.removeChild(showConditionEl.shadow);
      }

      const refRecord: TRefRecord = Ref.collectRef(Array.from(showConditionEl.target.childNodes) as TElement[], properties, properties.__OG__.reactive);
      Ref.updateRefMap(refRecord, properties);
      Ref.mergeRefMap(refRecord,properties.__OG__.reactive.refMap);

      conditionItem.current = showIndex;
    }
  }
} as TModuleOptions