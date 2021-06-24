/**
 *  [ 0:0 1:1 2:2 3 4 5 6 ]
 *  [ 0:{ user:admin, id:6 }, 1:{ user:test, id:8 } ]
 *  { uid:1, uid:2, uid:3 }
 *  { a:[1,2,3,4], b:[ 5,6,7,8 ] }
 *
 *  a : {
 *        b: {
 *            c :[1,2,3,4,5] _stateKey
 *             els: [ li,li,li,li,li ]
 *              _type=for
 *              _
 *            }
 *    }
 * { a.b.c:{ value,els:[] } }
 *  div > ul > (li._reactive + li._reactive)
 *  a.b.c > value,els => [ li,li._reactive.updateData(){ diff localData <-> new Data } ]
 *  component reactive & el reactive
 *
 *  1. reactive.observer -> el.__og__ -> collection depen -> set data peoperty proxy -> appen __og__ to el
 *  2. obj.a.b=2 -> proxyHandle.set -> reactive.updateData() -> reactive.diffData() -> reactive.updateView()
 *  el [ el ]
 *
 * a.b.c.push(6)
 * updateView
 */

import { IPlugins } from "../../types/pluginType";
import Plugin from "../plugin";
import Collect from "./collect";
import OProxy from "./oproxy";
import CollectTagRefs from "./plugins/CollecTagRefs";
import UpdateView from "./plugins/UpdateView";
import BuildInComponent from "./plugins/BuildInComponent";
import CollectTagAttrRefs from "./plugins/CollectTagAttrRefs";

Plugin.register("BuildInComponent", BuildInComponent);
Plugin.register("CollectTagRefs", CollectTagRefs);
Plugin.register("CollectTagAttrRefs", CollectTagAttrRefs);
Plugin.register("UpdateView", UpdateView);

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
  static deepGetObjectProperty(obj, propertyNames: string[]): { [key: string]: any, __els: HTMLElement[], __attrs: Attr[] } {
    if (obj[propertyNames[0]]) {
      return this.deepGetObjectProperty(obj[propertyNames[0]], propertyNames.slice(1));
    } else {
      return obj;
    }
  }
  static updateView(target, property, value, reveiver) {
    const refs = target.__og_root['refs'];
    const propertyNames: string[] = Collect.parsePropertyString(target.__og_stateKey);
    const propertys: { [key: string]: any, __els: HTMLElement[], __attrs: Attr[] } = this.deepGetObjectProperty(refs, propertyNames)

    const plugins: IPlugins = Plugin.use() as IPlugins;
    for (const pluginName in plugins) {
      if (Object.prototype.hasOwnProperty.call(plugins, pluginName)) {
        const pluginItem = plugins[pluginName];
        if (pluginItem.updateView) {
          pluginItem.updateView(target, propertys, property, value);
        }
      }
    }

    if (Array.isArray(target) && property !== "length") {
      if (propertys.__els && propertys.__els.length > 0) {
        propertys.__els.forEach(el => {
          el.textContent = target.toString();
        })
      }
      if (propertys.__attrs && propertys.__attrs.length > 0) {
        propertys.__attrs.forEach(attrItem => {
          attrItem.nodeValue = target.toString();
        });
      }
    }

  }
  constructor(target: HTMLElement | ShadowRoot, data: object) {
    this.target = target;
    this.data = data;
    this.rawData = JSON.parse(JSON.stringify(data));
    this.refs = Collect.reset(target as HTMLElement, data);

    const filterData = this.filterRawData(this.refs, data);
    OProxy.setProxy(data, filterData, [], this);
  }
  filterRawData(state, rawData) {
    const deps = JSON.parse(JSON.stringify(state));
    for (const key in deps) {
      if (Object.prototype.hasOwnProperty.call(deps, key)) {
        const element = deps[key];
        if (typeof element === "object" && element) {
          if (element.hasOwnProperty("__els") || element.hasOwnProperty("__attrs")) {
            deps[key] = rawData[key];
          } else {
            if (rawData) {
              deps[key] = this.filterRawData(element, rawData[key]);
            }
          }
        } else {
          if (rawData && rawData[key]) {
            deps[key] = rawData[key];
          }
        }
      }
    }
    return deps;
  }
}