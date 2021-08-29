import { generateExpressionRefTree } from "../../Expression";
import { transformPropertyName } from "../../Parser";
import { Ref } from "../../Rules";
import { IEl, IOGElement } from "../../types/ElementType";
import { TPluginItem } from "../../types/Plugin";
import { IProperties } from "../../types/Properties";
import { IRefTree, TAttr } from "../../types/Ref";
import Utils, { defineOGProperty } from "../../Utils";
import Collect from "../Collect";

const refItemRegExp: RegExp = new RegExp(Ref.Item, "g");

function collectElAttrRef(target: IEl, rootEl: IOGElement): IRefTree {
  let attrRefTree: IRefTree = {};
  defineOGProperty(target, {
    attrCollected: true
  });

  if (!(target as HTMLElement).attributes || (target as HTMLElement).attributes.length === 0) return attrRefTree;

  for (const attrItem of Array.from((target as HTMLElement).attributes) as TAttr[]) {
    if (!Ref.Item.test(attrItem.nodeValue)) continue;
    defineOGProperty(attrItem);

    const refs: string[] = attrItem.nodeValue.match(refItemRegExp);

    if (refs === null) return attrRefTree;
    let variables: string[] = refs.filter(item => {
      return Ref.variableItem.test(item);
    });
    let expressions: string[] = refs.filter(item => {
      return !Ref.variableItem.test(item);
    });
    Utils.objectAssign(attrRefTree, generateExpressionRefTree(expressions, attrItem, rootEl));

    for (const refItem of variables) {
      const variabledName: RegExpMatchArray = refItem.match(Ref.ExtractVariableName);
      if (variabledName === null) continue;

      const propertyNames: string[] = transformPropertyName(variabledName[0]);

      Utils.objectAssign(attrRefTree, Collect.generateElRefTree(propertyNames, attrItem));
    }

    attrItem.__og__.attrs = {
      nodeRawValue: attrItem.nodeValue
    };
  }
  return attrRefTree;
}

export default {
  collectElRef(target: IEl | Node[], properties: IProperties): IRefTree {
    let refTree: IRefTree = {};

    if (Array.isArray(target)) {
      for (const item of target) {
        Utils.objectAssign(refTree, this.collectElRef(item, properties));
      }
      return refTree;
    }

    if (target?.__og__?.attrCollected) return refTree;

    Utils.objectAssign(refTree, collectElAttrRef(target, properties));

    return refTree;
  }
} as TPluginItem