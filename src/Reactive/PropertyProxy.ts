import CustomElement from "../CustomElement";
import { TPropertyRef, TRefItem, TRefs } from "../Typings/RefType";
import Obj from "../Utils/Obj";
import Module from "./Module";
import Transform from "./Transform";
import View from "./View";

/**
 * 冒泡对对象设置为代理对象
 * @param refKeys 引用key数组
 * @param data 数据
 * @param upperKeys 上一级的keys
 * @param root 组件实例
 */
function bubbleSetProxy(refKeys: string[], data: any, upperKeys: string[], root: CustomElement): void {
  const propertyKey: string = refKeys[0];
  const target = data[propertyKey];
  if (typeof target === "object") {
    bubbleSetProxy(refKeys.slice(1), target, [...upperKeys, propertyKey], root);

    if (target.hasOwnProperty("__proxy__") === false) {
      data[propertyKey] = new Proxy(target, {
        set(target, propertyKey, value, receiver) {
          let targetProxy = target.__proxy__;

          let refKeys: string[] = [...targetProxy.refKeys, propertyKey];

          const refs: TRefs = targetProxy.root.__OG__.refs;
          const refKey: string = Transform.transformPropertyKeyToString(refKeys);

          if (refs[refKey] === undefined) {
            Reflect.set(target, propertyKey, value, receiver);
            Module.useAll("set", [refKeys, target, targetProxy.root]);
          } else {
            const oldValue: unknown = Obj.getObjectProperty(root, refKeys);
            Module.useAll("reflectBefore", [refs[refKey], refKeys, target, oldValue, targetProxy.root]);
            Reflect.set(target, propertyKey, value, receiver);
            Module.useAll("reflectAfter", [refs[refKey], refKeys, target, value, targetProxy.root]);
          }
          return true;
        },
        deleteProperty(target: any, propertyKey) {
          const ref: TRefItem = root.__OG__.refs[Transform.transformPropertyKeyToString([...refKeys, propertyKey.toString()])];

          Module.useAll("deleteProperty", [ref, target, propertyKey]);
          return true;
        }
      });

      const refKeys: string[] = [...upperKeys, propertyKey];
      Object.defineProperty(target, "__proxy__", {
        value: {
          refKeys,
          interpolation: propertyKey,
          refKey: Transform.transformPropertyKeyToString(refKeys),
          root: root
        },
        enumerable: false,
        configurable: false,
        writable: false
      });
    }
  }
}

/**
 * 根据插值引用设置代理对象
 * @param refs 插值引用
 * @param rawData 原始数据，指的是组件实例
 */
function setProxy(refs: TRefs, rawData: CustomElement) {
  for (const refKey in refs) {
    if (refKey === "__emptyRefs__") {
      continue;
    }
    const refKeys: string[] = refs[refKey]['__refKeys'];
    bubbleSetProxy(refKeys, rawData, [], rawData);
  }
}

export default {
  setProxy
}