import Reactive from ".";
import { ICustomElement } from "../Typings/CustomElementTypings";
import { TRefMap, TRefRecord, TRefs } from "../Typings/RefTypings";
import Utils from "../Utils";
import View from "./View";

function bubblingUpdateView(propertyKeyPath: string[], refMap: TRefMap, properties: ICustomElement): void {
  const refs: TRefs = refMap.get(propertyKeyPath.join());
  const value: any = Utils.getObjectProperty(properties, propertyKeyPath);
  View.setUpdateView(refs, value, properties);
  if (propertyKeyPath.length > 1) {
    bubblingUpdateView(propertyKeyPath.slice(0, propertyKeyPath.length - 1), refMap, properties);
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

      const propertiesKeyPath: string[] = [...target.__OG__.propertiesKeyPath,propertyKey];
      
      bubblingUpdateView(propertiesKeyPath, target.__OG__.refMap, target.__OG__.properties);
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