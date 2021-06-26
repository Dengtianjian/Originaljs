import Reactive from "./index";

export default class OProxy {
  static setProxy(rawData, filterData, path = [], reactiveInstance: Reactive) {
    for (const key in filterData) {
      if (Object.prototype.hasOwnProperty.call(filterData, key)) {
        path.push(key);
        if (typeof rawData[key] === "object") {
          this.setProxy(rawData[key], filterData[key], path, reactiveInstance);
          if (!rawData[key].__og_root) {
            Object.defineProperty(rawData[key], "__og_stateKey", {
              value: path.join("."),
              writable: false,
              configurable: false
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
                Reactive.updateView(target, propertyKey, value, receiver)
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