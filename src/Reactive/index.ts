import { IElement } from "../Typings/CustomElementTypings";
import { TRefTree } from "../Typings/RefTreeTypings";
import Utils from "../Utils";
import Module from "../Module";

Module.add("Element", {
  reactive: {
    start() {
      console.log("start");
    },
    collectRef() {
      console.log(arguments);
      return {};
    }
  }
});

/**
 * 遍历每一个节点，并且引用collectElRef、collectAttrRef钩子
 * @param target 遍历的目标元素或者元素数组
 * @param properties 属性
 */
function traverseNodes(target: IElement | Node[], properties: Record<string, any>): TRefTree {
  const refTree: TRefTree = {};

  if (!Array.isArray(target)) {
    target = [target];
  }
  if (target instanceof NodeList) {
    target = Array.from(target);
  }

  target.forEach(nodeItem => {
    for (const refPart of Module.useAll<TRefTree>("reactive.collecElRef", Array.from(arguments))) {
      Utils.objectMerge(refTree, refPart);
    }
    for (const refPart of Module.useAll<TRefTree>("reactive.collecElRef", Array.from(arguments))) {
      Utils.objectMerge(refTree, refPart);
    }
  });

  return refTree;
}

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
    const elRefTree: TRefTree = traverseNodes(target, properties);

    for (const item of Module.useAll<TRefTree>("reactive.collectRef", Array.from(arguments))) {
      Utils.objectMerge(elRefTree, item);
    }

    return elRefTree;
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