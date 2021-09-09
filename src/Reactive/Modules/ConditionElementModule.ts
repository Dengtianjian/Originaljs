import { TConditionElItem, TConditionItem } from "../../Typings/ConditionElementTypings";
import { TElement } from "../../Typings/CustomElementTypings";
import { TModuleOptions } from "../../Typings/ModuleTypings";
import { TRefTree } from "../../Typings/RefTypings";
import Utils from "../../Utils";
import Err from "../../Utils/Err";
const ConditionElTagNames: string[] = ["O-IF", "O-ELSE", "O-ELSE-IF"];
const Conditions: Map<symbol, TConditionItem> = new Map();

function getConditionElSibling(target: TElement | Element): TConditionElItem[] {
  const els: TConditionElItem[] = [{
    target,
    conditionAttr: target.attributes['condition'],
    shadow: new Comment(target.nodeName)
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
      if (Array.isArray(target)) {
        target.forEach(elItem => {
          this.collectElRef(elItem)
        })
        return {};
      }

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
          condition: {
            conditionKey
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
          const nodeValue: boolean = Boolean(Number(conditionElItem.conditionAttr.nodeValue));
          if (nodeValue === true) {
            showIndex = index;
            break;
          }
        } else if (conditionElItem.target.tagName === "O-ELSE") {
          showIndex = index;
          break;
        }
      }
      if (showIndex === conditionItem.current) {
        return;
      }

      if (conditionItem.current !== null) {
        const oldConditionEl: TConditionElItem = conditionItem.els[conditionItem.current];
        if (conditionItem.parentNode.contains(oldConditionEl.target)) {
          conditionItem.parentNode.insertBefore(oldConditionEl.shadow, oldConditionEl.target);
          conditionItem.parentNode.removeChild(oldConditionEl.target);
        } else {
          conditionItem.parentNode.appendChild(oldConditionEl.shadow);
        }
      }

      const showConditionEl: TConditionElItem = conditionItem.els[showIndex];
      if (conditionItem.parentNode.contains(showConditionEl.shadow)) {
        conditionItem.parentNode.insertBefore(showConditionEl.target, showConditionEl.shadow);
        conditionItem.parentNode.removeChild(showConditionEl.shadow);
      } else {
        conditionItem.parentNode.appendChild(showConditionEl.shadow);
      }
      conditionItem.current = showIndex;
    }
  }
} as TModuleOptions