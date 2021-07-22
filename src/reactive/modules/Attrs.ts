import { transformPropertyName } from "../../Parser";
import { Ref } from "../../Rules";
import { IEl } from "../../types/ElementType";
import { TPluginItem } from "../../types/Plugin";
import { IRefTree } from "../../types/Ref";
import Utils from "../../Utils";
import Collect from "../Collect";

export default {
  collectElAttrRef(target: IEl): IRefTree {
    let attrRefTree: IRefTree = {};
    Object.defineProperty(target, "__og__attrCollected", {
      value: true,
      configurable: false,
      writable: false,
      enumerable: false
    });
    if (!(target as HTMLElement).attributes || (target as HTMLElement).attributes.length === 0) return attrRefTree;

    for (const attrItem of Array.from((target as HTMLElement).attributes)) {
      if (!Ref.variableItem.test(attrItem.nodeValue)) continue;

      const refs: string[] = attrItem.nodeValue.match(new RegExp(Ref.variableItem, "g"));

      for (const refItem of refs) {
        const variabledName: RegExpMatchArray = refItem.match(Ref.ExtractVariableName);
        if (variabledName === null) continue;

        const propertyNames: string[] = transformPropertyName(variabledName[0]);

        Utils.objectAssign(attrRefTree, Collect.generateElRefTree(propertyNames, attrItem));
      }

      Object.defineProperty(attrItem, "__og__attrs", {
        value: {
          nodeRawValue: attrItem.nodeValue
        },
        configurable: false,
        enumerable: false,
        writable: false
      });
    }
    return attrRefTree;
  },
  collectRef(target: IEl): IRefTree {
    if (target.__og__attrCollected) return {};

    let attrRefTree: IRefTree = {};

    if (target.childNodes && target.childNodes.length > 0) {
      for (const childNode of Array.from(target.childNodes)) {
        Utils.objectAssign(attrRefTree, this.collectRef(childNode));
      }
    }

    attrRefTree = this.collectElAttrRef(target);

    return attrRefTree;
  }
} as TPluginItem