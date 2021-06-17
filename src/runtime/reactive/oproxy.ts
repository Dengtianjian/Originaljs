import Reactive from "./index";

export default class OProxy {
  static setProxy(data, path = []) {
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
          if (typeof data[key] === "object") {
            path.push(key);
            dataProxy[key] = this.setProxy(dataProxy[key], path);
          } else {
            dataProxy[key] = data[key];
          }
        }
      }
    }
    path.pop();
    return dataProxy;
  }
}