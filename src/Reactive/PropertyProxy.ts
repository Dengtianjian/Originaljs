import Reactive from ".";
import { ICustomElement } from "../Typings/CustomElementTypings";
import { TRefRecord, TRefs } from "../Typings/RefTypings";
import Utils from "../Utils";
import View from "./View";

function recursionSetProxy(propertyKeys: string[], properties: ICustomElement, reactiveInstance: Reactive, keys: string[] = []) {
  if (propertyKeys.length === 0) return;
  const propertyKey: string = propertyKeys[0];
  if (!properties[propertyKey] === undefined) return;

  if (typeof properties[propertyKey] !== "object") {
    properties[propertyKey] = properties[propertyKey];
    return;
  }

  recursionSetProxy(propertyKeys.slice(1), properties[propertyKey], reactiveInstance, [propertyKey]);

  if (properties[propertyKey].hasOwnProperty("__OG__")) return;

  Utils.defineOGProperty(properties[propertyKey], {
    propertyKeys: [...keys, propertyKey]
  });

  properties[propertyKey] = new Proxy(properties[propertyKey], {
    set(target: any, propertyKey: string | symbol, value: any, receiver: any): boolean {
      Reflect.set(target, propertyKey, value, receiver);

      const propertyKeys: string[] = [...target.__OG__.propertyKeys, propertyKey];
      const refs: TRefs = reactiveInstance.refMap.get(propertyKeys.join());

      View.setUpdateView(refs, target, propertyKey, value, reactiveInstance.properties);
      return true;
    },
    deleteProperty(target: any, propertyKey: string | symbol): boolean {
      return true;
    }
  })

}

function setProxy(refRecord: TRefRecord, properties: ICustomElement, reactiveInstance: Reactive): void {
  for (const propertyKey in refRecord) {
    const propertyKeys: string[] = propertyKey.split(",");

    recursionSetProxy(propertyKeys, properties, reactiveInstance);
  }

}

export default {
  setProxy,
};
