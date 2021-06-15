import Reactive from "./index";

export default class OProxy {
  static proxyHandle = {
    set() {
      // @ts-ignore
      Reflect.set(...arguments);
      Reactive.updateView(...arguments);
      return true;
    }
  }
  static setProxy(data) {
    const dataProxy = new Proxy(JSON.parse(JSON.stringify(data)), this.proxyHandle);
    if (typeof data === "object") {
      for (const key in dataProxy) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          if (typeof data[key] === "object") {
            dataProxy[key] = this.setProxy(dataProxy[key]);
          }
        }
      }
    }
    return dataProxy;
  }
}