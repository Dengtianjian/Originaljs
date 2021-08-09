import { transformPropertyName } from "../Parser";
import Plugin from "../Plugin";
import { getPropertyData } from "../Property";
import { IEl } from "../types/ElementType";
import { IProperties } from "../types/Properties";
import { IRefTree, TAttr, TText } from "../types/Ref";
import Utils, { defineOGProperty } from "../Utils";

function useCollectElRefHook(target: IEl | Node[], properties: IProperties): IRefTree {
  let refTree: IRefTree = {};
  if (Array.isArray(target)) {
    for (const nodeItem of target) {
      Utils.objectAssign(refTree, useCollectElRefHook(nodeItem as IEl, properties));
    }
    return refTree;
  } else if (target.nodeType !== 3 && target.childNodes.length > 0) {
    Utils.objectAssign(refTree, useCollectElRefHook(Array.from(target.childNodes), properties));
  };
  for (const item of Plugin.useAll<IRefTree[]>("collectElRef", [target, properties])) {
    Utils.objectAssign(refTree, item);
  };

  return refTree;
}

export function collection(target: IEl | Node[], properties: IProperties): IRefTree {
  let elRefTree: IRefTree = {};

  let refTree = useCollectElRefHook(target, properties);
  
  console.log(3);
  
  Utils.objectAssign(elRefTree, refTree);

  for (const item of Plugin.useAll<IRefTree[]>("collectRef", [target, properties])) {
    Utils.objectAssign(elRefTree, item);
  }
  
  console.log(elRefTree.number.__els); 
  
  Utils.objectAssign(properties.__og__.refTree,elRefTree);
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
  let propertyNamesMirroring: string[] = [...propertyNames];
  let propertyName: string = propertyNamesMirroring.pop();
  defineOGProperty(refEl, {
    ref: {
      tree,
      propertyNames,
      propertyName,
      branch: getPropertyData(propertyNames, tree),
      parentBranch: getPropertyData(propertyNamesMirroring, tree)
    }
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

export default {
  collection,
  generateElRefTree,
  propertyHasKey
}