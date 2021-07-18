import { Ref } from "../../Rules";
import { IEl } from "../../types/ElementType";
import { TPluginItem } from "../../types/Plugin";
import { IRefTree } from "../../types/Ref";
import Utils from "../../Utils";

export default {
  collectRef(target, properties): IRefTree {
    let refTree: IRefTree = {};

    if (target.__og__isCollected) {
      return refTree
    }
    Object.defineProperty(target, "__og__isCollected", {
      value: true,
      configurable: false,
      writable: true,
      enumerable: false
    });

    if (target.childNodes.length > 0) {
      for (const childNode of Array.from(target.childNodes)) {
        refTree = Utils.objectAssign(refTree, this.collectRef(childNode));
      }
    }

    if (target.nodeType !== 3) return refTree;

    let refs: RegExpMatchArray = target.textContent.match(new RegExp(Ref.variableItem, "g"));

    if (refs === null) return refTree;

    const parentNode: IEl = target.parentNode as IEl;
    const appendTextEls: Text[] = [];

    for (let index = 0; index < refs.length; index++) {
      let variableName: unknown = refs[index].match(new RegExp(Ref.ExtractVariableName));
      if (variableName === null) continue;

      variableName = variableName[0];

      // const 

    }


    return refTree;
  }
} as TPluginItem