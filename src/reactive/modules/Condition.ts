import { transformPropertyName } from "../../Parser";
import { Ref } from "../../Rules";
import { TConditionElItem, TConditionItem } from "../../types/ConditionElType";
import { TPluginItem } from "../../types/Plugin";
import { IProperties } from "../../types/Properties";
import { IRefTree } from "../../types/Ref";
import Utils from "../../Utils";
import Collect, { propertyHasKey } from "../Collect";

const conditions: Record<string, TConditionItem> = {};
const ConditionElTagNames: string[] = ["O-IF", "O-ELSE", "O-ELSE-IF"];

function getConditionElSibling(target: Element): TConditionElItem[] {
  let els: TConditionElItem[] = [{
    target,
    conditionAttr: target.attributes['condition'],
    substitute: null,
    parentElement: target.parentNode as HTMLElement
  }];

  if (target.tagName !== "O-ELSE" && target.nextElementSibling) {
    if (!target.attributes['condition']) throw new Error("Condition element is missing condition attribute");
    els.push(...getConditionElSibling(target.nextElementSibling));
  }

  return els;
}

export default {
  collectElRef(target: HTMLElement, properties: IProperties): IRefTree {
    if (target.tagName !== "O-IF") return {};
    if (!target.attributes['condition']) throw new Error("Condition element is missing condition attribute");

    let els: TConditionElItem[] = getConditionElSibling(target);

    let refTree: IRefTree = {};
    const matchVariableName: RegExp = new RegExp(Ref.VariableName, "g");
    let variableNames: string[] = [];
    for (const el of els) {
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
          }
        }));
      }
    });

    return refTree;
  }
} as TPluginItem