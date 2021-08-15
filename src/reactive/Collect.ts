import { transformPropertyName } from "../Parser";
import Plugin from "../Plugin";
import { getPropertyData } from "../Property";
import { Ref } from "../Rules";
import { IEl } from "../types/ElementType";
import { IProperties } from "../types/Properties";
import { IRefTree, TAttr, TText } from "../types/Ref";
import Utils from "../Utils";

function useCollectElRefHook(target: IEl | Node[], properties: IProperties): IRefTree {
  let refTree: IRefTree = {};
  if (Array.isArray(target)) {
    for (const nodeItem of target as HTMLElement[]) {
      if (nodeItem.attributes && nodeItem.attributes.length > 0) {
        Array.from(nodeItem.attributes).forEach(attrItem => {
          for (const item of Plugin.useAll<IRefTree[]>("collectElAttrRef", [attrItem, properties])) {
            Utils.objectAssign(refTree, item);
          };
        })
      }
      Utils.objectAssign(refTree, useCollectElRefHook(nodeItem as IEl, properties));
    }
    return refTree;
  }
  for (const item of Plugin.useAll<IRefTree[]>("collectElRef", [target, properties])) {
    Utils.objectAssign(refTree, item);
  };
  if (target.nodeType !== 3 && target.childNodes.length > 0) {
    Utils.objectAssign(refTree, useCollectElRefHook(Array.from(target.childNodes), properties));
  };
  if (target.attributes && target.attributes.length > 0) {
    Array.from(target.attributes).forEach(attrItem => {
      for (const item of Plugin.useAll<IRefTree[]>("collectElAttrRef", [attrItem, properties])) {
        Utils.objectAssign(refTree, item);
      };
    })
  }

  return refTree;
}

export function collection(target: IEl | Node[], properties: IProperties): IRefTree {
  let elRefTree: IRefTree = {};
  let refTree = useCollectElRefHook(target, properties);

  Utils.objectAssign(elRefTree, refTree);

  for (const item of Plugin.useAll<IRefTree[]>("collectRef", [target, properties])) {
    Utils.objectAssign(elRefTree, item);
  }

  return elRefTree;
}

export function generateElRefTree(propertyNames: string[], refEl: TAttr | TText): IRefTree {
  let tree: IRefTree = {};

  let branchName: string = "__els";
  if (refEl instanceof Attr) {
    branchName = "__attrs";
  }

  tree = Utils.generateObjectTree(propertyNames, {
    [branchName]: [refEl]
  });

  return tree;
}

export function propertyHasKey(keys: string | string[], properties: IProperties): boolean {
  if (typeof keys === "string") {
    keys = transformPropertyName(keys);
  }
  if (properties[keys[0]] === undefined) {
    return false
  } else if (keys.length === 1) {
    return true;
  }
  properties = properties[keys[0]];
  keys.shift();
  return propertyHasKey(keys, properties);
}

const ExtractRefItemGlobalRegExp: RegExp = new RegExp(Ref.ExtractItem, "g");
export function getRefs(rawString: string): string[] {
  let refSet: string[] = [];
  if (Ref.Item.test(rawString) === false) return refSet;
  let refs: RegExpMatchArray = rawString.match(ExtractRefItemGlobalRegExp);
  if (refs !== null) refSet = refs;

  return refSet;
}

export default {
  collection,
  generateElRefTree,
  propertyHasKey
}