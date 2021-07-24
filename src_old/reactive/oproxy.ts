import { IReactiveItem } from "../types/reactiveType";
import Reactive from "./index";
import View from "./view";

export default class OProxy {
  static setProxy(rawData, filterData, path = [], reactiveInstance: Reactive) {
    for (const key in filterData) {
      if (Object.prototype.hasOwnProperty.call(filterData, key)) {
        path.push(key);
        if (typeof rawData[key] === "object" && rawData[key] !== null && rawData[key] !== undefined) {
          this.setProxy(rawData[key], filterData[key], path, reactiveInstance);
          if (!rawData[key].__og_root) {
            Object.defineProperty(rawData[key], "__og_stateKey", {
              value: path.join("."),
              writable: false,
              configurable: false,
              enumerable: false
            });
            Object.defineProperty(rawData[key], "__og_root", {
              value: reactiveInstance,
              writable: false,
              configurable: false,
              enumerable: false
            });
            rawData[key] = new Proxy(rawData[key], {
              set(target: object, propertyKey: PropertyKey, value: any, receiver?: any) {
                Reflect.set(target, propertyKey, value, receiver);
                View.setUpdateView(target as IReactiveItem, propertyKey, value, receiver)
                return true;
              },
              defineProperty(target, property, attrubutes) {
                Reflect.defineProperty(target, property, attrubutes);
                return true;
              },
              deleteProperty(target, property) {
                View.deleteUpdateView(target, property);
                Reflect.deleteProperty(target, property)
                return true;
              }
            });
          }
        }
        path.pop();
      }

    }
  }
}