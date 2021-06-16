import Reactive from "./index";

export default class OProxy {
  static proxyHandle: ProxyHandler<any> = {
    set(target, property, value, reveiver) {
      Reflect.set(target, property, value, reveiver);
      Reactive.updateView(target, property, value, reveiver);
      return true;
    }
  }
  static setProxy(data, path = []) {
    const dataProxy = new Proxy(JSON.parse(JSON.stringify(data)), {
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
            // console.log(path, data[key]);
          }
        }
      }
    }
    path.pop();
    return dataProxy;
  }
}