import { generateExpressionRefTree } from "../../Expression";
import { transformPropertyName } from "../../Parser";
import { Ref } from "../../Rules";
import { IEl, IOGElement } from "../../types/ElementType";
import { TPluginItem } from "../../types/Plugin";
import { IProperties } from "../../types/Properties";
import { IRefTree } from "../../types/Ref";
import Utils from "../../Utils";
import Collect from "../Collect";

export default {
  collectElAttrRef(target: IEl, rootEl: IOGElement): IRefTree {
    let attrRefTree: IRefTree = {};
    Utils.defineProperty(target, "__og__attrCollected", true);

    if (!(target as HTMLElement).attributes || (target as HTMLElement).attributes.length === 0) return attrRefTree;

    for (const attrItem of Array.from((target as HTMLElement).attributes)) {
      if (!Ref.Item.test(attrItem.nodeValue)) continue;

      const refs: string[] = attrItem.nodeValue.match(new RegExp(Ref.Item, "g"));
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

      Utils.defineProperty(attrItem, "__og__attrs", {
        nodeRawValue: attrItem.nodeValue
      });
    }
    return attrRefTree;
  },
  collectElRef(target: IEl | Node[], properties: IProperties): IRefTree {
    let refTree: IRefTree = {};

    if (Array.isArray(target)) {
      for (const item of target) {
        Utils.objectAssign(refTree, this.collectElRef(item, properties));
      }
      return refTree;
    }

    if (target.__og__attrCollected) return refTree;

    Utils.objectAssign(refTree, this.collectElAttrRef(target, properties));

    return refTree;
  }
} as TPluginItem