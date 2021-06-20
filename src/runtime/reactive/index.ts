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

import { Query } from "../selector";
import Collect from "./collect";
import OProxy from "./oproxy";

export default class Reactive {
  static data;
  target: HTMLElement | ShadowRoot;
  data: object;
  rawData: object;
  refs: object;
  constructor(target: HTMLElement | ShadowRoot, data: object) {
    this.target = target;
    this.data = data;
    this.rawData = JSON.parse(JSON.stringify(data));
    Collect.reset(target, data);
    // this.refs = Collect.reset(target, data);

    // const filterData = this.filterRawData(this.refs, data);

    // console.log(this.refs);

    // OProxy.setProxy(data, filterData, [], this);
  }
  static observer(target: HTMLElement | ShadowRoot, data: object) {
    Object.defineProperty(target, "__og__", {
      value: new Reactive(target, data),
      configurable: false
    });
  }
  static deepGetObjectProperty(obj, propertyNames: string[]) {
    if (obj[propertyNames[0]]) {
      return this.deepGetObjectProperty(obj[propertyNames[0]], propertyNames.slice(1));
    } else {
      return obj;
    }

  }
  static updateView(target, property, value, reveiver) {
    // if (target['__og_rawData'][property] == target[property]) {
    //   return;
    // }

    const refs = target.__og_root['refs'];
    const propertyNames = Collect.parsePropertyString(target.__og_stateKey);
    const r = this.deepGetObjectProperty(refs, propertyNames)

    if (r[property]) {
      const replaceValue: string = value.toString();
      if (r[property]._els) {
        const els = r[property]['_els'];

        els.forEach(el => {
          el.textContent = replaceValue + "\n";
        })
      }
      if (r[property]._attrs) {
        const attrs = r[property]['_attrs'];
        attrs.forEach(attr => {
          attr.nodeValue = replaceValue;
        })
      }
    } else {
      if (Array.isArray(target) && property !== "length") {
        r[property] = {
          _els: [],
          _attrs: []
        }
      }
    }
  }
  filterRawData(state, rawData) {
    const deps = JSON.parse(JSON.stringify(state));
    for (const key in deps) {
      if (Object.prototype.hasOwnProperty.call(deps, key)) {
        const element = deps[key];
        if (typeof element === "object" && element) {
          if (element.hasOwnProperty("_els") || element.hasOwnProperty("_attrs")) {
            deps[key] = rawData[key];
          } else {
            deps[key] = this.filterRawData(element, rawData[key]);
          }
        } else {
          deps[key] = rawData[key];
        }
      }
    }
    return deps;
  }
}

const data = {
  user: {
    name: {
      firstName: "Admin"
    },
    numbers: [
      2, 666, 3, {
        name: 2
      }, {
        a: [2]
      }, 6, 7, 8, 9, 2021
    ],
    friends: [
      {
        name: {
          firstName: "A"
        }
      }, {
        name: {
          firstName: "B"
        }
      }
    ]
  }
}
Reactive.observer(Query("#app"), data)
// data.user.numbers.push(1);
data.user.friends[0].name.firstName = "Time:";
// data.user.numbers.push(2);
// data.user.numbers.push(3);
data.user.numbers[0] = 888;
// setInterval(() => {
//   // data.user.numbers[0] = Date.now();
//   const D = new Date();
//   const s = `${D.getFullYear()}年${D.getMonth() + 1}月${D.getDate()}号 ${D.getHours()}:${D.getMinutes()}:${D.getSeconds() < 10 ? '0' + D.getSeconds() : D.getSeconds()}`;
//   data.user.friends[1].name.firstName = s;
//   data.user.numbers[0] = s;
// }, 1000);
