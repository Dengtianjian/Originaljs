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
import { Collect } from "./collect";
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
    this.refs = Collect.reset(target, data);
    const filterData = this.filterRawData(this.refs, data);
    const proxyData=OProxy.setProxy(filterData);
    console.log(proxyData);

  }
  static observer(target: HTMLElement | ShadowRoot, data: object) {
    Object.defineProperty(target, "__og__", {
      value: new Reactive(target, data),
      configurable: false
    });
  }
  static updateView(target, property, value, reveiver) {
    if (target['__og_rawData'][property] == target[property]) {
      return;
    }
    // console.log(target['__og_rawData'][property], target[property]);

  }
  filterRawData(state, rawData) {
    const deps = JSON.parse(JSON.stringify(state));
    for (const key in deps) {
      if (Object.prototype.hasOwnProperty.call(deps, key)) {
        const element = deps[key];
        if (typeof element === "object") {
          if (element.hasOwnProperty("_els")) {
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
      1, 2, 3, 4, {
        a: [2]
      }, 6, 7, 8
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
// rd.user.friends[0].name.firstName = "C";
console.log(data);
