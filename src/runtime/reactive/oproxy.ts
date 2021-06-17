import Reactive from "./index";

export default class OProxy {
  static _setProxy(data, path = [], rawData) {
    const dataProxy = new Proxy(data, {
      set: (target, property, value, reveiver) => {
        Reflect.set(target, property, value, reveiver);
        if (!target['__og_stateKey']) {
          Object.defineProperty(target, "__og_stateKey", {
            value: path.join("."),
            writable: false,
            configurable: false,
            enumerable: false
          })
        }
        if (!target['__og_rawData']) {
          Object.defineProperty(target, "__og_rawData", {
            value: data,
            writable: false,
            configurable: false,
            enumerable: false
          })
        }

        Reactive.updateView(target, property, value, reveiver);
        return true;
      }
    });
    if (typeof data === "object") {
      for (const key in dataProxy) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          if (typeof rawData[key] === "object") {
            path.push(key);
            rawData[key] = this.setProxy(rawData[key], path, rawData);
          } else {
            dataProxy[key] = data[key];
          }
        }
      }
    }
    path.pop();
    return dataProxy;
  }
  static setProxy(rawData, filterData, path = []) {
    for (const key in filterData) {
      if (Object.prototype.hasOwnProperty.call(filterData, key)) {
        if (typeof rawData[key] === "object") {
          this.setProxy(rawData[key], filterData[key], path);
          rawData[key] = new Proxy(rawData[key], {
            set(target: object, propertyKey: PropertyKey, value: any, receiver?: any) {
              Reflect.set(target, propertyKey, value, receiver);
              return true;
            }
          });
        } else {
          // rawData = new Proxy(rawData, {
          //   set() {
          //     return true;
          //   }
          // })
        }
      }
    }
  }
}