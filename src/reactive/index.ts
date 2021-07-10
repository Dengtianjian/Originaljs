import Plugin from "../plugin";
import Collect from "./collect";
import OProxy from "./oproxy";
import CollectTagRefs from "./plugins/CollecTagRefs";
import BuildInComponent from "./plugins/BuildInComponent";
import CollectTagAttrRefs from "./plugins/CollectTagAttrRefs";
import { IElement } from "../types/elementType";
import collect from "./collect";
import { TPropertys } from "../types/pluginType";

Plugin.register("BuildInComponent", BuildInComponent);
Plugin.register("CollectTagRefs", CollectTagRefs);
Plugin.register("CollectTagAttrRefs", CollectTagAttrRefs);

export default class Reactive {
  static data;
  target: HTMLElement | ShadowRoot;
  data: object;
  rawData: object;
  refs: object;
  static observer(target: HTMLElement | ShadowRoot, data: object) {
    Object.defineProperty(target, "__og__", {
      value: new Reactive(target, data),
      configurable: false
    });
  }
  constructor(target: HTMLElement | ShadowRoot, data: object) {
    this.target = target;
    this.data = data;
    // this.rawData = JSON.parse(JSON.stringify(data));
    this.refs = Collect.reset(target as IElement, data);

    const filterData = collect.filterHasRefData(this.refs, data);

    OProxy.setProxy(data, filterData, [], this);
  }
}