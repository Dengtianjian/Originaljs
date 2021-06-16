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
import ODOM from "./odom";
import OProxy from "./oproxy";

export default class Reactive {
  static data;
  static observer(target, data) {
    const OG = {};
    this.data = data;
    OG['rawData'] = data;
    OG['state'] = Collect.reset(target, data);

    console.log(OG['state'], data);

    let r = this.filterRawData(OG['state'], data);

    OG['data'] = data = OProxy.setProxy(r);
    console.log(OG['data']);


    Object.defineProperty(target, "__og__", {
      value: OG,
      configurable: false
    });

    return OG['data'];
  }

  static updateView(target, property, value, reveiver) {
    console.log(target, property, value);
  }
  static filterRawData(state, rawData) {
    for (const key in state) {
      if (Object.prototype.hasOwnProperty.call(state, key)) {
        const element = state[key];
        if (typeof element === "object") {
          if (element['_els']) {
            state[key] = rawData[key];
          } else {
            this.filterRawData(element, rawData[key]);
          }
        }
      }
    }
    return state;
  }
}

const data = {
  user: {
    name: {
      firstName: "Admin"
    },
    numbers: [
      1, 2, 3, 4, 5, 6, 7, 8
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
const rd = Reactive.observer(Query("#app"), data)
rd.user.friends[0].name.firstName = "C";