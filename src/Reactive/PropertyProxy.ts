import Reactive from ".";
import { ICustomElement, TElement } from "../Typings/CustomElementTypings";
import { TRefMap, TRefRecord, TRefs } from "../Typings/RefTypings";
import Utils from "../Utils";
import View from "./View";

function bubblingUpdateView(target: TElement, propertyKey: string | symbol, value: any, receiver: any): void {
  const refMap: TRefMap = target.__OG__.reactive.refMap;
  const propertyKeyPath: (string | symbol)[] = [...target.__OG__.propertiesKeyPath, propertyKey];

  const refs: TRefs = refMap.get(propertyKeyPath.join());

  View.setUpdateView(refs, target, propertyKey, value, target.__OG__.properties);
  if (propertyKeyPath.length > 1) {
    let newTarget: any = target;
    const newPropertyKeyPath: (string | symbol)[] = propertyKeyPath.slice(0, propertyKeyPath.length - 1);
    let newPropertyKey: string | symbol = newPropertyKeyPath[newPropertyKeyPath.length - 1];
    if (propertyKeyPath.length === 2) {
      newTarget = target.__OG__.properties;
    } else {
      newTarget = Utils.getObjectProperty(target.__OG__.properties, newPropertyKeyPath);
      newPropertyKey = propertyKeyPath[propertyKeyPath.length - 2];
    }
    value = Utils.getObjectProperty(target.__OG__.properties, newPropertyKeyPath);

    bubblingUpdateView(newTarget, newPropertyKey, value, target.__OG__.properties);
  }
}

function setPropertyToProxy(propertyNames: string[], properties: ICustomElement, reactiveInstance: Reactive, paths: string[] = []): void {
  const propertyName: string = propertyNames[0];
  if (properties[propertyName] === undefined || typeof properties[propertyName] !== "object") return;

  setPropertyToProxy(propertyNames.slice(1), properties[propertyName], reactiveInstance, [propertyName]);

  if (properties[propertyName].hasOwnProperty('__OG__')) return;

  Utils.defineOGProperty(properties[propertyName], {
    propertiesKeyPath: [...paths, propertyName],
    reactive: reactiveInstance,
    refMap: reactiveInstance.refMap,
    properties: reactiveInstance.properties
  });

  properties[propertyName] = new Proxy(properties[propertyName], {
    set(target, propertyKey, value: any, receiver: any): boolean {
      Reflect.set(target, propertyKey, value, receiver);

      bubblingUpdateView(target, propertyKey, value, receiver);
      return true;
    },
    deleteProperty(...rest): boolean {
      Reflect.deleteProperty(...rest);
      return View.deleteUpdateView(...rest);
    }
  })
}

function setProxy(refTree: TRefRecord, properties: ICustomElement, reactiveInstance: Reactive): void {
  for (const propertyNameString in refTree) {
    const propertyNames: string[] = propertyNameString.split(",");

    setPropertyToProxy(propertyNames, properties, reactiveInstance);
  }
}

export default {
  setProxy
}