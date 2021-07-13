import Plugin from "../plugin";
import Collect from "./collect";
import OProxy from "./oproxy";
import CollectTagRefs from "./plugins/CollecTagRefs";
import BuildInComponent from "./plugins/BuildInComponent";
import CollectTagAttrRefs from "./plugins/CollectTagAttrRefs";
import { IElement } from "../types/elementType";
import { TRefTree } from "../types/pluginType";
import Parser from "./parser";
import { IProperties } from "../types/reactiveType";

Plugin.register("BuildInComponent", BuildInComponent);
Plugin.register("CollectTagRefs", CollectTagRefs);
Plugin.register("CollectTagAttrRefs", CollectTagAttrRefs);

export default class Reactive {
  target: HTMLElement | ShadowRoot;
  data: object;
  refs: TRefTree;
  static observer(target: HTMLElement | ShadowRoot, data: object) {
    Object.defineProperty(target, "__og__", {
      value: new Reactive(target, data),
      configurable: false,
      enumerable: false,
      writable: false
    });
  }
  constructor(target: HTMLElement | ShadowRoot, properties: IProperties) {
    this.target = target;
    this.data = properties;

    //* 收集 ref 引用 转换成 引用树
    this.refs = Collect.collection(target as IElement, properties);

    //* 编译模板语法
    Parser.parseRef(this.refs, properties);

    //* 过滤被模板引用的数据，并且设置为proxy对象
    const filterData = Collect.filterHasRefProperties(this.refs, properties);
    OProxy.setProxy(properties, filterData, [], this);
  }
}