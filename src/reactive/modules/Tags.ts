import { setProxy } from "../../OGProxy";
import { transformPropertyName } from "../../Parser";
import Plugin from "../../Plugin";
import { Ref } from "../../Rules";
import { IEl } from "../../types/ElementType";
import { TPluginItem } from "../../types/Plugin";
import { IRefTree } from "../../types/Ref";
import Utils from "../../Utils";
import { deepUpdateRef, removeRefTree, updateRef } from "../../View";
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
    let paths: string[] = target.__og__propertiesPath.split(".");
    paths.push(String(propertyKey))
    if (typeof value === "object") {
      setProxy(refTree[propertyKey], target[propertyKey], target.__og__reactive, paths);

      deepUpdateRef(refTree[propertyKey], target[propertyKey]);
    }

    updateRef(refTree[propertyKey], target.__og__reactive.properties, paths);

    return true;
  },
  deleteUpdateView(target: IEl, propertyKey): Boolean {
    // TODO 全局 target.__og__propertiesPath改为数组。paths用数组存储
    let paths: string[] = target.__og__propertiesPath.split(".");
    let refTree: IRefTree = Utils.deepGetObjectProperty(target.__og__reactive.refTree,paths);

    paths.push(String(propertyKey));
    removeRefTree(refTree[propertyKey], paths, true);

    delete refTree[propertyKey];

    return true;
  }
} as TPluginItem