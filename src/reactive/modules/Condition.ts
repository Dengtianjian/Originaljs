import { transformPropertyName } from "../../Parser";
import { Ref } from "../../Rules";
import { TConditionElItem, TConditionItem } from "../../types/ConditionElType";
import { TPluginItem } from "../../types/Plugin";
import { IProperties } from "../../types/Properties";
import { IRefTree } from "../../types/Ref";
import Utils, { defineOGProperty } from "../../Utils";
import { propertyHasKey } from "../Collect";

const conditions: Record<string, TConditionItem> = {};
const ConditionElTagNames: string[] = ["O-IF", "O-ELSE", "O-ELSE-IF"];

function getConditionElSibling(target: Element): TConditionElItem[] {
  if (!ConditionElTagNames.includes(target.nodeName)) return [];

  let els: TConditionElItem[] = [{
    target,
    conditionAttr: target.attributes['condition'],
    substitute: new Comment(target.nodeName),
    parentElement: target.parentNode as HTMLElement
  }];

  if (target.tagName !== "O-ELSE" && target.nextElementSibling) {
    if (!target.attributes['condition']) throw new Error("Condition element is missing condition attribute");
    els.push(...getConditionElSibling(target.nextElementSibling));
  }
  defineOGProperty(target, {
    conditionCollected: true
  });

  return els;
}

export default {
  collectElRef(target: HTMLElement, properties: IProperties): IRefTree {
    if (!ConditionElTagNames.includes(target.tagName)) return {};
    if (['O-ELSE-IF', 'O-ELSE'].includes(target.tagName)) {
      if (!target.__og__ || !target.__og__.conditionCollected) {
        throw new Error("o-if element is required be fore o-else-if or o-else element");
      }
      return {};
    }
    if (!target.attributes['condition']) throw new Error("Condition element is missing condition attribute");

    let els: TConditionElItem[] = getConditionElSibling(target);

    let refTree: IRefTree = {};
    const matchVariableName: RegExp = new RegExp(Ref.VariableName, "g");
    let variableNames: string[] = [];
    for (const el of els) {
      el.parentElement.insertBefore(el.substitute, el.target);
      el.parentElement.removeChild(el.target);

      if (!el.conditionAttr) continue;
      let expression: string = el.conditionAttr.nodeValue;
      const refs: string[] = expression.match(matchVariableName);
      if (refs === null) continue;
      variableNames.push(...refs);
    }
    variableNames = Array.from(new Set(variableNames));
    const conditionKey: string = String(Date.now());
    const condition: TConditionItem = {
      els,
      current: null
    };
    conditions[conditionKey] = condition;
    variableNames.forEach(name => {
      if (propertyHasKey(name, properties)) {
        Utils.objectAssign(refTree, Utils.generateObjectTree(transformPropertyName(name), {
          __conditions: {
            [conditionKey]: conditions[conditionKey]
          },
          __has: true
        }));
      }
    });

    return refTree;
  }
} as TPluginItem