import { IElement } from "../Typings/CustomElementTypings";
import { TRefTree } from "../Typings/RefTreeTypings";
import Utils from "../Utils";
import Module from "../Module";

Module.add("Element", {
  reactive: {
    start() {
      console.log("start");
    }
  }
})

export default class Reactive {
  private refTree: TRefTree = {};
  /**
   * 观察元素
   * @param target 观察的目标元素或者目标元素数组
   * @param properties 引用的数据
   * @returns 观察实例
   */
  static observe(target: IElement | Node[], properties: Record<string, any>): Reactive {
    return new Reactive(target, properties);
  }
  static collectEl(target: IElement | Node[], properties: Record<string, any>, reactiveInstance: Reactive): TRefTree {
    Module.useAll("reactive.start", Array.from(arguments));

    return {};
  }
  constructor(private target: IElement | Node[], private properties: Record<string, any>) {
    let defineProperties: Record<string, any> = {
      reactive: this,
      refTree: this.refTree,
      propertiesKeyPath: "",
      properties
    };
    if (Array.isArray(target)) {
      target.forEach(item => {
        Utils.defineOGProperty(item, defineProperties);
      })
    } else {
      Utils.defineOGProperty(target, defineProperties);
    }

    Reactive.collectEl(target, properties, this);
  }
}