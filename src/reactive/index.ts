import { setProxy } from "../OGProxy";
import Plugin from "../Plugin";
import { IEl } from "../types/ElementType";
import { IProperties } from "../types/Properties";
import { IRefTree } from "../types/Ref";
import Utils, { defineOGProperty } from "../Utils";
import { deepUpdateRef } from "../View";
import Collect from "./Collect";
import Attrs from "./modules/Attrs";
import Transition from "./modules/Transition";
import Tags from "./modules/Tags";
import For from "./modules/For";
import Condition from "./modules/Condition";
import El from "./modules/El";

Plugin.register('For', For);
Plugin.register('Condition', Condition);
Plugin.register("Tags", Tags);
Plugin.register("Attrs", Attrs);
Plugin.register("Transition", Transition);
Plugin.register("El", El);

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
    // Utils.objectAssign(this.refTree, refTree);
  }
}

function collectEl(target: IEl | Node[], properties: IProperties, reactiveInstance: Reactive):IRefTree {
  //* 1. 收集引用
  Collect.collection(target, properties);
  let refTree: IRefTree = properties.__og__.refTree;

  //* 2. 设置Proxy
  setProxy(refTree, properties, reactiveInstance);

  //* 3. 引用转换实体值
  deepUpdateRef(refTree, properties);

  return refTree;
}

export default {
  collectEl
}