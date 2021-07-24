import { setProxy } from "../OGProxy";
import Plugin from "../Plugin";
import { IEl } from "../types/ElementType";
import { IProperties } from "../types/Properties";
import { IRefTree } from "../types/Ref";
import Utils from "../Utils";
import { deepUpdateRef } from "../View";
import Collect from "./Collect";
import Attrs from "./modules/Attrs";
import Buildin from "./modules/buildin";
import Tags from "./modules/Tags";

Plugin.register('Buildin', Buildin);
Plugin.register("Tags", Tags);
Plugin.register("Attrs", Attrs);

export class Reactive {
  target: IEl = null;
  properties: IProperties = null;
  refTree: IRefTree = null;
  static observe(target: IEl, refData: IProperties): Reactive {
    const reactiveInstance = new Reactive(target, refData);
    return reactiveInstance;
  }
  constructor(target: IEl, properties: IProperties) {
    this.target = target;
    this.properties = properties;

    if (!properties.__og__reactive) {
      Utils.defineProperty(properties, "__og__reactive", this);
    }
    if (!properties.__og__propertiesPath) {
      Utils.defineProperty(properties, "__og__propertiesPath", "");
    }

    this.refTree = collectEl(target, properties, this);
  }
}

function collectEl(target: IEl | Node[], properties: IProperties, reactiveInstance: Reactive): IRefTree {
  let refTree: IRefTree = {};
  //* 1. 收集引用
  refTree = Collect.collection(target, properties);

  //* 2. 设置Proxy
  setProxy(refTree, properties, reactiveInstance);

  //* 3. 引用转换实体值
  deepUpdateRef(refTree, properties);

  return refTree;
}

export default {
  collectEl
}