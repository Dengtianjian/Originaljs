import Reactive from ".";
import Module from "../Module";
import { ICustomElement } from "../Typings/CustomElementTypings";
import { TRefRecord, TRefs } from "../Typings/RefTypings";
import Utils from "../Utils";

function recursionSetProxy(propertyKeys: string[], properties: ICustomElement, reactiveInstance: Reactive, keys: string[] = [], recursive: boolean = true) {
  if (propertyKeys.length === 0) return;
  const propertyKey: string = propertyKeys[0];
  if (!properties[propertyKey] === undefined) return;

  if (typeof properties[propertyKey] !== "object") {
    return;
  }

  if (recursive) {
    recursionSetProxy(propertyKeys.slice(1), properties[propertyKey], reactiveInstance, [...keys, propertyKey]);
  }

  if (properties[propertyKey].hasOwnProperty("__OG__")) return;
  
  Utils.defineOGProperty(properties[propertyKey], {
    propertyKeys: [...keys, propertyKey]
  });

  properties[propertyKey] = new Proxy(properties[propertyKey], {
    set(target: any, propertyKey: string | symbol, value: any, receiver: any): boolean {
      const isHas: boolean = target.hasOwnProperty(propertyKey);

      const result: boolean = Reflect.set(target, propertyKey, value, receiver);
      if (result === false) return false;
      const propertyKeys: string[] = [...target.__OG__.propertyKeys, propertyKey];

      let refs: TRefs = reactiveInstance.refMap.get(propertyKeys.join());
      if (refs === undefined) {
        refs = reactiveInstance.refMap.get(propertyKeys.slice(0, propertyKeys.length - 1).join());
        if (refs === undefined) return true;
      }
      if (isHas) {
        Module.useAll("reactive.updateProperty", [refs, target, propertyKey, value, reactiveInstance.properties, receiver, propertyKeys]);
      } else {
        Module.useAll("reactive.setProperty", [refs, target, propertyKey, value, reactiveInstance.properties, receiver, propertyKeys]);
      }
      return true;
    },
    deleteProperty(target: any, propertyKey: string | symbol): boolean {
      return true;
    }
  })

}

function setProxy(refRecord: TRefRecord, properties: ICustomElement, reactiveInstance: Reactive, recursive: boolean = true): void {
  for (const propertyKey in refRecord) {
    const propertyKeys: string[] = propertyKey.split(",");

    recursionSetProxy(propertyKeys, properties, reactiveInstance, [], recursive);
  }

}

export default {
  setProxy,
};
