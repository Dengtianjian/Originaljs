import { setProxy } from "../../OGProxy";
import { transformPropertyName } from "../../Parser";
import Plugin from "../../Plugin";
import { Ref } from "../../Rules";
import { IEl } from "../../types/ElementType";
import { TPluginItem } from "../../types/Plugin";
import { IRefTree } from "../../types/Ref";
import Utils from "../../Utils";
import { deepUpdateRef, updateRef } from "../../View";
import Collect from "../Collect";

export default {
  collectRef(target): IRefTree {
    let refTree: IRefTree = {};

    if (target.__og__tagCollected) {
      return refTree
    }
    Object.defineProperty(target, "__og__tagCollected", {
      value: true,
      configurable: false,
      writable: true,
      enumerable: false
    });

    if (target.childNodes.length > 0) {
      for (const childNode of Array.from(target.childNodes)) {
        refTree = Utils.objectAssign(refTree, this.collectRef(childNode));
        refTree = Utils.objectAssign(refTree, Plugin.use("Attrs").collectElAttrRef(childNode))
      }
    }

    if (target.nodeType !== 3) return refTree;

    let refs: RegExpMatchArray = target.textContent.match(new RegExp(Ref.variableItem, "g"));

    if (refs === null) return refTree;

    const parentNode: IEl = target.parentNode as IEl;
    const newTextChildNodes: Text[] = [];

    for (let index = 0; index < refs.length; index++) {
      let variableNameMatchs: unknown = refs[index].match(new RegExp(Ref.ExtractVariableName));
      if (variableNameMatchs === null) continue;

      let variableName = String(variableNameMatchs[0]).trim();

      const previousText: string = target.textContent.slice(0, target.textContent.indexOf(refs[index]));
      if (previousText) {
        newTextChildNodes.push(document.createTextNode(previousText));
        target.textContent = target.textContent.slice(target.textContent.indexOf(refs[index]));
      }

      const newTextEl: Text = document.createTextNode(`{${variableName}}`);
      const propertyNames: string[] = transformPropertyName(variableName);

      refTree = Utils.objectAssign(refTree, Collect.generateElRefTree(propertyNames, newTextEl));

      newTextChildNodes.push(newTextEl);

      const replaceRefString: string = "\{ *" + variableName.replace(/([\.\[\]])/g, "\\$1") + "? *\}";

      target.textContent = target.textContent.replace(new RegExp(replaceRefString), "");
    }
    for (const newTextChildNode of newTextChildNodes) {
      parentNode.insertBefore(newTextChildNode, target);
    }

    refTree = Utils.objectAssign(refTree, Plugin.use("Attrs").collectElAttrRef(target));

    return refTree;
  },
  setUpdateView(target, refTree, propertyKey, value): boolean {
    if (typeof value === "object") {
      setProxy(refTree, target, target.__og__reactive, target.__og__propertiesPath.split("."));

      deepUpdateRef(refTree[propertyKey], target[propertyKey]);
    }

    updateRef(refTree, target.__og__reactive.properties, propertyKey);

    return true;
  }
} as TPluginItem