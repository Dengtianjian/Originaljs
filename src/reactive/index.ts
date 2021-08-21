import { setProxy } from "../OGProxy";
import Plugin from "../Plugin";
import { IEl } from "../types/ElementType";
import { IProperties } from "../types/Properties";
import { IRefTree, TAttr, TText } from "../types/Ref";
import Utils, { defineOGProperty } from "../Utils";
import { deepUpdateRef } from "../View";
import Collect from "./Collect";
import Attrs from "./modules/Attrs";
import Transition from "./modules/Transition";
import Tags from "./modules/Tags";
import For from "./modules/For";
import Condition from "./modules/Condition";
import El from "./modules/El";
import { bindMethods } from "../Method";
import Method from "./modules/Method";

Plugin.register('For', For);
Plugin.register('Condition', Condition);
Plugin.register("Tags", Tags);
Plugin.register("Attrs", Attrs);
Plugin.register("Transition", Transition);
Plugin.register("El", El);
Plugin.register("Method", Method);

export class Reactive {
  target: IEl = null;
  properties: IProperties = null;
  refTree: IRefTree = {};
  static observe(target: IEl, refData: IProperties): Reactive {
    const reactiveInstance = new Reactive(target, refData);
    return reactiveInstance;
  }
  constructor(target: IEl, properties: IProperties) {
    this.target = target;
    this.properties = properties;

    properties.__og__.reactive = this;
    properties.__og__.refTree = this.refTree;
    properties.__og__.propertiesPath = "";
    properties.__og__.properties = properties;

    collectEl(target, properties, this);
  }
}

function elAddRefTreeProperty(refTree: IRefTree): void {
  for (const branchName in refTree) {
    if (!refTree[branchName]) continue;
    if (refTree.hasOwnProperty(branchName) && !Array.isArray(refTree[branchName])) {
      const branch: IRefTree = refTree[branchName];
      const els: TText[] = branch.__els;
      const attrs: TAttr[] = branch.__attrs;

      if (typeof branch === "object") {
        elAddRefTreeProperty(branch);
      }

      if (els) {
        for (let index = 0; index < els.length; index++) {
          const elItem = els[index];
          if (!elItem.__og__.ref) {
            defineOGProperty(elItem, {
              ref: {
                branch,
                parentBranch: refTree,
                branchName,
                propertyKey: index
              }
            });
          }
        }
      }

      if (attrs && attrs.length > 0) {
        attrs.forEach((item, index) => {
          if (!item.__og__.ref) {
            defineOGProperty(item, {
              ref: {
                branch,
                parentBranch: refTree,
                branchName,
                propertyKey: index
              }
            });
          }
        });
      }
    }
  }
}

function collectEl(target: IEl | Node[], properties: IProperties, reactiveInstance: Reactive): IRefTree {
  Plugin.useAll("start", [target, properties, reactiveInstance]);

  //* 1. 收集引用
  let refTree: IRefTree = Collect.collection(target, properties);

  //* 2. 设置Proxy
  setProxy(refTree, properties, reactiveInstance);

  //* 3. 引用转换实体值
  deepUpdateRef(refTree, properties);

  Utils.objectAssign(reactiveInstance.refTree, refTree);

  elAddRefTreeProperty(reactiveInstance.refTree);

  Plugin.useAll("end", [target, properties, reactiveInstance]);

  // bindMethods(target, properties, properties);
  return refTree;
}

export default {
  collectEl
}