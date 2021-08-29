import { generateExpressionRefTree } from "../../Expression";
import { setProxy } from "../../OGProxy";
import { propertyNamesToPath, transformPropertyName } from "../../Parser";
import { Ref } from "../../Rules";
import { IEl, IOGElement } from "../../types/ElementType";
import { TPluginItem } from "../../types/Plugin";
import { IRefTree, TText } from "../../types/Ref";
import Utils, { defineOGProperty } from "../../Utils";
import { deepUpdateRef, removeRefTree, updateRef } from "../../View";
import Collect from "../Collect";

export default {
  collectElRef(target: IEl, rootEl: IOGElement): IRefTree {
    let refTree: IRefTree = {};

    if (Array.isArray(target)) {
      for (const nodeItem of target) {
        Utils.objectAssign(refTree, this.collectElRef(nodeItem, rootEl));
      }
      return refTree;
    }

    if (target?.__og__?.tagCollected) return;
    defineOGProperty(target, {
      tagCollected: true
    });

    if (target.nodeType !== 3) return refTree;

    let refs: RegExpMatchArray = target.textContent.match(new RegExp(Ref.Item, "g"));
    if (refs === null) return refTree;
    let variables: string[] = refs.filter(item => {
      return Ref.variableItem.test(item);
    });
    let expressions: string[] = refs.filter(item => {
      return !Ref.variableItem.test(item);
    });

    Utils.objectAssign(refTree, generateExpressionRefTree(expressions, target, rootEl));

    if (variables === null) return refTree;

    const parentNode: IEl = target.parentNode as IEl;
    const newTextChildNodes: Text[] = [];

    for (let index = 0; index < variables.length; index++) {
      let variableNameMatchs: unknown = variables[index].match(new RegExp(Ref.ExtractVariableName));
      if (variableNameMatchs === null) continue;

      let variableName = String(variableNameMatchs[0]).trim();


      const previousText: string = target.textContent.slice(0, target.textContent.indexOf(variables[index]));
      if (previousText) {
        newTextChildNodes.push(document.createTextNode(previousText));
        target.textContent = target.textContent.slice(target.textContent.indexOf(variables[index]));
      }

      const newTextEl: TText = document.createTextNode(`{${variableName}}`);
      const propertyNames: string[] = transformPropertyName(variableName);
      Utils.defineProperty(newTextEl, "__og__", {
        parsed: false
      }, false, false, true);

      Utils.objectAssign(refTree, Collect.generateElRefTree(propertyNames, newTextEl));

      newTextChildNodes.push(newTextEl);

      const replaceRefString: string = "\{ *" + variableName.replace(/([\.\[\]])/g, "\\$1") + "? *\}";

      target.textContent = target.textContent.replace(new RegExp(replaceRefString), "");
    }
    for (const newTextChildNode of newTextChildNodes) {
      parentNode.insertBefore(newTextChildNode, target);
    }

    defineOGProperty(parentNode, {
      hasRef: true
    });

    return refTree;
  },
  setUpdateView(target, refTree, propertyKey, value): boolean {
    let paths: string[] = transformPropertyName(target.__og__.propertiesPath);
    paths.push(String(propertyKey))
    if (typeof value === "object") {
      let parentPaths: string[] = [...paths];
      parentPaths.pop();
      setProxy(refTree, target, target.__og__.reactive, parentPaths);

      deepUpdateRef(refTree[propertyKey], target[propertyKey]);
    }

    //* 更新父级对象的视图
    updateRef(refTree, target.__og__.properties, propertyNamesToPath(paths.slice(0, paths.length - 1)));

    //* 再更新当前属性的试图
    refTree = Array.isArray(target) ? refTree : refTree[propertyKey];
    if (refTree) {
      updateRef(refTree, target.__og__.properties, propertyNamesToPath(paths));
    }

    return true;
  },
  deleteUpdateView(target: IEl, propertyKey): Boolean {
    // TODO 全局 target.__og__.propertiesPath改为数组。paths用数组存储
    let paths: string[] = transformPropertyName(target.__og__.propertiesPath);
    let refTree: IRefTree = Utils.deepGetObjectProperty(target.__og__.refTree, paths);

    paths.push(String(propertyKey));
    removeRefTree(refTree[propertyKey], paths, true);

    delete refTree[propertyKey];

    return true;
  }
} as TPluginItem