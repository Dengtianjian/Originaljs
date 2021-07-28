import { setProxy } from "../../OGProxy";
import { transformPropertyName } from "../../Parser";
import Plugin from "../../Plugin";
import { getPropertyData } from "../../Property";
import { Ref } from "../../Rules";
import { IEl, IOGElement } from "../../types/ElementType";
import { TPluginItem } from "../../types/Plugin";
import { IRefTree } from "../../types/Ref";
import Utils from "../../Utils";
import { deepUpdateRef, removeRefTree, updateRef } from "../../View";
import Collect from "../Collect";

export default {
  el(target: IEl, rootEl: IOGElement) {
    return;
    if (target.__og__tagCollected) return;
    Utils.defineProperty(target, "__og__tagCollected", true);

    if (target.nodeType !== 3) return;

    let refTree: IRefTree = {};

    let refs: RegExpMatchArray = target.textContent.match(new RegExp(Ref.variableItem, "g"));
    if (refs === null) return;

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

      Utils.objectAssign(refTree, Collect.generateElRefTree(propertyNames, newTextEl));

      newTextChildNodes.push(newTextEl);

      const replaceRefString: string = "\{ *" + variableName.replace(/([\.\[\]])/g, "\\$1") + "? *\}";

      target.textContent = target.textContent.replace(new RegExp(replaceRefString), "");
    }
    for (const newTextChildNode of newTextChildNodes) {
      parentNode.insertBefore(newTextChildNode, target);
    }

    Utils.objectAssign(refTree, Plugin.use("Attrs").collectElAttrRef(target));
    Utils.objectAssign(rootEl.__og__reactive.refTree, refTree);
  },
  collectRef(target, properties): IRefTree {
    let refTree: IRefTree = {};

    if (Array.isArray(target)) {
      for (const nodeItem of target) {
        Utils.objectAssign(refTree, this.collectRef(nodeItem, properties));
      }
      return refTree;
    }

    if (target.__og__tagCollected) return refTree;

    Utils.defineProperty(target, "__og__tagCollected", true);

    if (target.childNodes.length > 0) {
      for (const childNode of Array.from(target.childNodes)) {
        Utils.objectAssign(refTree, this.collectRef(childNode, properties));
        Utils.objectAssign(refTree, Plugin.use("Attrs").collectElAttrRef(childNode))
      }
    }

    Plugin.useAll("el", [target, properties]);
    if (target.nodeType !== 3) return refTree;

    // const matchRefRegExp: RegExp = new RegExp(Ref.variableItem, "g");
    // let variables: RegExpMatchArray = target.textContent.match(/\{ *.+ *\}/g);
    // let expressions: string[] = [];
    // let refs: string[] = variables.filter(value => {
    //   if (matchRefRegExp.test(value)) {
    //     return value;
    //   } else {
    //     expressions.push(value);
    //   }
    // });
    // expressions[0] = expressions[0].replace(new RegExp("\{ *(.+) *\}"), "$1");
    // const propertys = expressions[0].match(new RegExp(Ref.VariableName, "g"));
    // const source = [];
    // propertys.forEach(item => {
    //   source.push(getPropertyData(item, properties));
    // });
    // propertys.push("return " + expressions[0]);
    // console.log(new Function(...propertys)(...source));
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

      Utils.objectAssign(refTree, Collect.generateElRefTree(propertyNames, newTextEl));

      newTextChildNodes.push(newTextEl);

      const replaceRefString: string = "\{ *" + variableName.replace(/([\.\[\]])/g, "\\$1") + "? *\}";

      target.textContent = target.textContent.replace(new RegExp(replaceRefString), "");
    }
    for (const newTextChildNode of newTextChildNodes) {
      parentNode.insertBefore(newTextChildNode, target);
    }

    Utils.objectAssign(refTree, Plugin.use("Attrs").collectElAttrRef(target));
    Utils.objectAssign(properties.__og__reactive.refTree, refTree);

    return refTree;
  },
  setUpdateView(target, refTree, propertyKey, value): boolean {
    let paths: string[] = target.__og__propertiesPath.split(".");
    paths.push(String(propertyKey))
    if (typeof value === "object") {
      setProxy(refTree[propertyKey], target[propertyKey], target.__og__reactive, paths);

      deepUpdateRef(refTree[propertyKey], target[propertyKey]);
    }

    updateRef(refTree[propertyKey], target.__og__reactive.properties, paths.join("."));

    return true;
  },
  deleteUpdateView(target: IEl, propertyKey): Boolean {
    // TODO 全局 target.__og__propertiesPath改为数组。paths用数组存储
    let paths: string[] = target.__og__propertiesPath.split(".");
    let refTree: IRefTree = Utils.deepGetObjectProperty(target.__og__reactive.refTree, paths);

    paths.push(String(propertyKey));
    removeRefTree(refTree[propertyKey], paths, true);

    delete refTree[propertyKey];

    return true;
  }
} as TPluginItem