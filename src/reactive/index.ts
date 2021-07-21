import { setProxy } from "../OGProxy";
import { parseRef } from "../Parser";
import Plugin from "../Plugin";
import { IEl } from "../types/ElementType";
import { IProperties } from "../types/Properties";
import { IRefTree } from "../types/Ref";
import Collect from "./Collect";
import Attrs from "./modules/Attrs";
import Buildin from "./modules/Buildin";
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

    //* 1. 收集引用
    this.refTree = Collect.collection(target, properties);

    //* 2. 引用转换实体值
    parseRef(this.refTree, properties);

    //* 3. 设置Proxy
    setProxy(this.refTree, properties, this);
  }
}