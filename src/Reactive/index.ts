import { ICustomElement, TElement } from "../Typings/CustomElementTypings";
import { TRefRecord, TRefTree } from "../Typings/RefTypings";
import Utils from "../Utils";
import Module from "../Module";
import ElementModule from "./Modules/ElementModule";
import PropertyProxy from "./PropertyProxy";
import Ref from "./Ref";
import ExpressionModule from "./Modules/ExpressionModule";
import AttrModule from "./Modules/AttrModule";
import MethodModule from "./Modules/MethodModule";
import DynamicElementModule from "./Modules/DynamicElementModule";
import TransitionElement from "./Modules/TransitionElement";
import ConditionElementModule from "./Modules/ConditionElementModule";

Module.add("ExpressionModule", ExpressionModule);
Module.add("MethodModule", MethodModule);
Module.add("DynamicElementModule", DynamicElementModule);
Module.add("ConditionElementModule", ConditionElementModule);
Module.add("ElementModule", ElementModule);
Module.add("TransitionElement", TransitionElement);
Module.add("AttrModule", AttrModule);

/**
 * 遍历每一个节点，并且引用collectElRef、collectAttrRef钩子
 * @param target 遍历的目标元素或者元素数组
 * @param properties 属性
 */
function traverseNodes(target: TElement | TElement[], properties: Record<string, any>): TRefRecord {
  const refTree: TRefRecord = {};

  if (!Array.isArray(target)) {
    target = [target];
  }
  if (target instanceof NodeList) {
    target = Array.from(target);
  }

  for (const elementItem of target) {
    for (const refPart of Module.useAll<TRefRecord>("reactive.collecElRef", [elementItem, properties])) {
      Utils.objectMerge(refTree, refPart);
    }
    //* 判断是否需要跳过属性收集以来
    if ((!elementItem.__OG__ || elementItem.__OG__ && !elementItem.__OG__.skipAttrCollect) && (elementItem.attributes && elementItem.attributes.length > 0)) {
      Array.from(elementItem.attributes).forEach(attrItem => {
        for (const refPart of Module.useAll<TRefRecord>("reactive.collectAttrRef", [attrItem, properties])) {
          Utils.objectMerge(refTree, refPart);
        }
      });
    }

    //* 判断是否需要跳过收集子元素依赖
    if (elementItem.__OG__ && elementItem.__OG__.skipChildNodesCollect) {
      continue;
    }

    if (elementItem.childNodes && elementItem.childNodes.length > 0) {
      for (const nodeItem of Array.from(elementItem.childNodes)) {
        Utils.objectMerge(refTree, traverseNodes(nodeItem as TElement, properties));
      }
    }
  }

  return refTree;
}

export default class Reactive {
  refTree: TRefTree = {};
  refMap: Map<string, TRefTree> = new Map();
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
    const elRefTreeMap: TRefRecord = traverseNodes(target, properties);

    for (const item of Module.useAll<TRefTree>("reactive.collectRef", Array.from(arguments))) {
      Utils.objectMerge(elRefTreeMap, item);
    }

    PropertyProxy.setProxy(elRefTreeMap, properties, reactiveInstance);
    Ref.updateRef(elRefTreeMap, properties);

    for (const key in elRefTreeMap) {
      if (reactiveInstance.refMap.has(key)) {
        Utils.objectMerge(reactiveInstance.refMap.get(key), elRefTreeMap[key]);
      } else {
        reactiveInstance.refMap.set(key, elRefTreeMap[key]);
      }
    }
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