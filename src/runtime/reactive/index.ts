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
import OProxy from "./oproxy";

export default class Reactive {
  static observer(target, data) {
    const OG = {};
    OG['rawData'] = data;
    OG['data'] = data = OProxy.setProxy(data);
    console.log(OG);

    Object.defineProperty(target, "__og__", {
      value: OG,
      configurable: false
    });
  }

  static updateView(target, value) {
    console.log(target, value);

  }
}

const data = {
  user: {
    name: "admin"
  }
}
Reactive.observer(Query("#app"), data)
console.log(data);


