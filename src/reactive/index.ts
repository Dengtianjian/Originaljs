import { setProxy } from "../OGProxy";
import { parseRef } from "../Parser";
import Plugin from "../Plugin";
import { IEl } from "../types/ElementType";
import { IProperties } from "../types/Properties";
import { IRefTree } from "../types/Ref";
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
    Object.defineProperty(target, "__og__reactive", {
      value: reactiveInstance,
      configurable: false,
      enumerable: false,
      writable: false
    });
    return reactiveInstance;
  }
  constructor(target: IEl, properties: IProperties) {
    this.target = target;
    this.properties = properties;

    this.refTree = collectEl(target, properties, this);
  }
}

function collectEl(target: IEl | Node[], properties: IProperties, reactiveInstance: Reactive): IRefTree {
  let refTree: IRefTree = {};
  //* 1. 收集引用
  refTree = Collect.collection(target, properties);

  //* 2. 引用转换实体值
  parseRef(refTree, properties);

  //* 3. 设置Proxy
  setProxy(refTree, properties, reactiveInstance);

  return refTree;
}

export default {
  collectEl
}