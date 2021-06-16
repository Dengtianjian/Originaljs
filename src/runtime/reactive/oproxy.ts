import Reactive from "./index";

export default class OProxy {
  static proxyHandle: ProxyHandler<any> = {
    set(target, property, value, reveiver) {
      Reflect.set(target, property, value, reveiver);
      Reactive.updateView(target, property, value, reveiver);
      return true;
    }
  }
  static setProxy(data, path = "") {
    // console.log(path);

    const dataProxy = new Proxy(JSON.parse(JSON.stringify(data)), {
      set: (target, property, value, reveiver) => {
        Reflect.set(target, property, value, reveiver);
        Reactive.updateView(target, property, value, reveiver);
        return true;
      }
    });
    if (typeof data === "object") {
      for (const key in dataProxy) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          if (typeof data[key] === "object") {
            path += `['${key}']`;
            dataProxy[key] = this.setProxy(dataProxy[key], path);
          }
        }
      }
    }
    return dataProxy;
  }
}