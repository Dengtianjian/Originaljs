import { ICustomElement, TElement, TReferrerElementOGProperties } from "../../Typings/CustomElementTypings";
import { TModuleOptions } from "../../Typings/ModuleTypings";
import { TExpressionInfo, TMethodBranch, TMethodRef, TRefRecord, TRefs } from "../../Typings/RefTypings";
import { MethodRules, RefRules } from "../Rules";
import Parser from "../Parser";
import Utils from "../../Utils";
import Ref from "../Ref";
import Expression from "../Expression";
import Err from "../../Utils/Err";

const GlobalMatchMethodName: RegExp = new RegExp(MethodRules.MatchMethodName, "g");

function bindMethod(methodItem: TMethodBranch, properties: ICustomElement) {
  if (!properties[methodItem.methodName]) {
    Err.error(`Method ${methodItem.methodName} is not define`);
    return;
  }
  if (typeof properties[methodItem.methodName] !== "function") {
    Err.error("The element monitoring must be a function");
    return;
  }

  //* 参数转换
  if (methodItem.refParamsMap.size > 0) {
    methodItem.refParamsMap.forEach((refParamItem, paramIndex) => {
      methodItem.params[paramIndex] = Expression.executeExpression(refParamItem, properties);
    })
  }

  let listener = function (event): any {
    properties[methodItem.methodName].apply(properties, [...methodItem.params, event, methodItem.ownerElement]);
  }

  //   //* 移除旧的监听事件
  if (methodItem.listener !== null) {
    methodItem.ownerElement.removeEventListener(methodItem.eventType, methodItem.listener);
  }
  //   //* 监听元素事件
  methodItem.ownerElement.addEventListener(methodItem.eventType, listener);
  methodItem.listener = listener;
}

export default {
  reactive: {
    collectAttrRef(target: Attr, properties: ICustomElement): TRefRecord {
      if (target.ownerElement === null) return {};
      if (MethodRules.OnAttributeName.test(target.nodeName) === false || MethodRules.MethodNameAttibuteValue.test(target.nodeValue) === false) return {};

      //* 绑定的方法，可多个
      const methodNames: string[] = target.nodeValue.match(GlobalMatchMethodName);
      //* 方法触发类型
      const eventType: string = target.nodeName.match(MethodRules.MethodType)[0];
      if (!eventType || !methodNames) return {};

      const refRecord: TRefRecord = {};

      const ownerElement: HTMLElement = target.ownerElement as HTMLElement;
      ownerElement[target.nodeName] = null; //* 清除已有方法

      const methodMap: Map<symbol, TMethodBranch> = new Map();
      for (let methodName of methodNames) {
        let paramString = methodName.match(MethodRules.MethodParams);
        let params: string[] = [];
        const mapKey: symbol = Symbol(`${eventType}:${methodName}`);
        const refParamsMap: Map<number, TExpressionInfo> = new Map();

        if (paramString) {
          params = Parser.parseMethodParams(paramString[0]);
          for (let index = 0; index < params.length; index++) {
            const param = params[index];
            const paramRefPropertyKeys: string[][] = Ref.getRefPropertyKey(param) as string[][];
            if (paramRefPropertyKeys.length === 0) continue;

            const expressionInfo: TExpressionInfo = Expression.generateExpressionInfo(param);
            Utils.objectMerge(refRecord, Ref.generateRefRecord<TMethodRef>(paramRefPropertyKeys[0], ownerElement, mapKey, {
              mapKey,
              expressionInfo,
              ownerElement
            }, "__methods"));
            refParamsMap.set(index, expressionInfo);
          }
        }

        let extractMethodName: string[] | string = methodName.match(MethodRules.MethodName);
        extractMethodName = extractMethodName ? extractMethodName[0] : null;
        const methodItem: TMethodBranch = {
          mapKey,
          params,
          refParamsMap,
          listener: null,
          eventType,
          methodName: extractMethodName,
          ownerElement: ownerElement as TElement,
          target
        }
        methodMap.set(mapKey, methodItem);

        if (params.length === 0) {
          bindMethod(methodItem, properties);
        }
      }

      Utils.defineOGProperty<TReferrerElementOGProperties>(ownerElement, {
        refs: {
          "__methods": methodMap
        },
      });
      ownerElement.removeAttribute(target.nodeName); //* 移除属性

      return refRecord;
    },
    updateProperty(refs: TRefs, target: any, propertyKey: string | symbol, value: any, properties: ICustomElement) {
      if (refs?.__methods === undefined) return;

      refs.__methods.forEach((methodItem, mapKey) => {
        bindMethod(methodItem.ownerElement.__OG__.refs.__methods.get(mapKey), properties);
      });
    }
  }
} as TModuleOptions