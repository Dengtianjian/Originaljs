import Plugin from "../Plugin";
import { IEl } from "../types/ElementType";
import { IProperties } from "../types/Properties";
import { IRefTree } from "../types/Ref";
import Utils from "../Utils";

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

  Utils.objectAssign(elRefTree, useCollectElRefHook(target, properties));

  for (const item of Plugin.useAll<IRefTree[]>("collectRef", [target, properties])) {
    Utils.objectAssign(elRefTree, item);
  }

  return elRefTree;
}

export function generateElRefTree(propertyNames: string[], refEl: Attr | Text): IRefTree {
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

export default {
  collection,
  generateElRefTree
}