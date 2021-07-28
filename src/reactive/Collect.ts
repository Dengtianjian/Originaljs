import Plugin from "../Plugin";
import { IEl } from "../types/ElementType";
import { IProperties } from "../types/Properties";
import { IRefTree } from "../types/Ref";
import Utils from "../Utils";

function useElHook(target: IEl | Node[], properties: IProperties): void {
  if (Array.isArray(target)) {
    for (const nodeItem of target) {
      useElHook(nodeItem as IEl, properties);
    }
    return;
  } else if (target.nodeType !== 3 && target.childNodes.length > 0) useElHook(Array.from(target.childNodes), properties);
  Plugin.useAll("el", [target, properties]);
}

export function collection(target: IEl | Node[], properties: IProperties): IRefTree {
  let elRefTree: IRefTree = {};

  useElHook(target, properties);

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