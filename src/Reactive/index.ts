import { ICustomElement, TElement } from "../Typings/CustomElementTypings";
import { TRefTree } from "../Typings/RefTreeTypings";
import Utils from "../Utils";
import Module from "../Module";
import ElementModule from "./Modules/ElementModule";
import PropertyProxy from "./PropertyProxy";
import Ref from "./Ref";
import ExpressionModule from "./Modules/ExpressionModule";
import AttrModule from "./Modules/AttrModule";
import MethodModule from "./Modules/MethodModule";

Module.add("ElementModule", ElementModule);
Module.add("AttrModule", AttrModule);
Module.add("MethodModule", MethodModule);
Module.add("ExpressionModule", ExpressionModule);

/**
 * 遍历每一个节点，并且引用collectElRef、collectAttrRef钩子
 * @param target 遍历的目标元素或者元素数组
 * @param properties 属性
 */
function traverseNodes(target: TElement | TElement[], properties: Record<string, any>): TRefTree {
  const refTree: TRefTree = {};

  if (!Array.isArray(target)) {
    target = [target];
  }
  if (target instanceof NodeList) {
    target = Array.from(target);
  }

  target.forEach(elementItem => {
    for (const refPart of Module.useAll<TRefTree>("reactive.collecElRef", [elementItem, properties])) {
      Utils.objectMerge(refTree, refPart);
    }
    if (elementItem.attributes && elementItem.attributes.length > 0) {
      Array.from(elementItem.attributes).forEach(attrItem => {
        for (const refPart of Module.useAll<TRefTree>("reactive.collectAttrRef", [attrItem, properties])) {
          Utils.objectMerge(refTree, refPart);
        }
      });
    }
    if (elementItem.childNodes && elementItem.childNodes.length > 0) {
      elementItem.childNodes.forEach(nodeItem => {
        Utils.objectMerge(refTree, traverseNodes(nodeItem as TElement, properties));
      });
    }
  });

  return refTree;
}

export default class Reactive {
  refTree: TRefTree = {};
  /**
   * 观察元素
   * @param target 观察的目标元素或者目标元素数组
   * @param properties 引用的数据
   * @returns 观察实例
   */
  static observe(target: TElement | TElement[], properties: ICustomElement): Reactive {
    return new Reactive(target, properties);
  }
  static collectEl(target: TElement | TElement[], properties: ICustomElement, reactiveInstance: Reactive) {
    Module.useAll("reactive.start", Array.from(arguments));
    const elRefTree: TRefTree = traverseNodes(target, properties);

    for (const item of Module.useAll<TRefTree>("reactive.collectRef", Array.from(arguments))) {
      Utils.objectMerge(elRefTree, item);
    }

    Utils.objectMerge(reactiveInstance.refTree, elRefTree);

    if (Object.keys(properties.__OG__.refTree).length === 0) {
      properties.__OG__.refTree = reactiveInstance.refTree;
    }

    PropertyProxy.setProxy(elRefTree, properties, reactiveInstance);

    Ref.updateRef(elRefTree, properties);
  }
  constructor(private target: TElement | TElement[], public properties: ICustomElement) {
    let defineProperties: Record<string, any> = {
      reactive: this,
      refTree: null,
      propertiesKeyPath: [],
      properties
    };
    if (Array.isArray(target)) {
      target.forEach(item => {
        Utils.defineOGProperty(item, defineProperties);
      });
    } else {
      Utils.defineOGProperty(properties, defineProperties);
    }

    Reactive.collectEl(target, properties, this);
  }
}