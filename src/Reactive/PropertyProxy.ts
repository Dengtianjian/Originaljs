import CustomElement from "../CustomElement";
import { TRefs } from "../Typings/RefType";
import Transform from "./Transform";
import View from "./View";

function bubbleSetProxy(refKeys: string[], data: any, upperKeys: string[], root: CustomElement) {
  const propertyKey: string = refKeys[0];
  const target = data[propertyKey];
  if (typeof target === "object") {
    bubbleSetProxy(refKeys.slice(1), target, [...upperKeys, propertyKey], root);

    if (target.hasOwnProperty("__proxy__") === false) {
      data[propertyKey] = new Proxy(target, {
        set(target, propertyKey, value, receiver) {
          let targetProxy = target.__proxy__;

          let refKeys: string[] = [...targetProxy.refKeys, propertyKey];

          Reflect.set(target, propertyKey, value, receiver);

          const refs: TRefs = targetProxy.root.__OG__.refs;
          const refKey: string = Transform.transformPropertyKeyToString(refKeys);

          if (refs[refKey]) {
            View.updateView(refs[refKey], targetProxy.root);
          }
          return true;
        }
      });

      Object.defineProperty(target, "__proxy__", {
        value: {
          refKeys: [...upperKeys, propertyKey],
          refKey: propertyKey,
          root: root
        },
        enumerable: false,
        configurable: false,
        writable: false
      });
    }
  }
}

export default {
  setProxy(refs: TRefs, rawData: CustomElement) {
    for (const refKey in refs) {
      if (refKey === "__emptyRefs__") {
        continue;
      }
      const refKeys: string[] = refs[refKey]['__refKeys'];
      bubbleSetProxy(refKeys, rawData, [], rawData);
    }
  }
}