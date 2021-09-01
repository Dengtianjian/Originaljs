import { ICustomElement } from "../../Typings/CustomElementTypings";
import { TModuleOptions } from "../../Typings/ModuleTypings";
import { TMethodBranch, TRefTree } from "../../Typings/RefTreeTypings";
import { MethodRules, RefRules } from "../Rules";
import Parser from "../Parser";
import Utils from "../../Utils";
import Ref from "../Ref";
import Transform from "../Transform";

const GlobalMatchMethodName: RegExp = new RegExp(MethodRules.MatchMethodName, "g");

function bindMethod(methodItem: TMethodBranch, properties: Record<string, any>) {
  if (!properties[methodItem.methodName]) {
    console.error(`Method ${methodItem.methodName} is not define`);
    return;
  }

  if (methodItem.refParams > 0) {
    const refParams: Record<number, string[]> = methodItem.refParamsMap;
    for (const index in refParams) {
      methodItem.params[index] = Transform.transformObjectToString(Utils.getObjectProperty(properties, refParams[index]));
    }
  }

  const listener = function (event): any {
    properties[methodItem.methodName].apply(methodItem.ownerElement, [...methodItem.params, event, methodItem.ownerElement]);
  }

  //* 移除旧的监听事件
  if (methodItem.listener !== null) {
    methodItem.ownerElement.removeEventListener(methodItem.eventType, methodItem.listener);
  }
  //* 监听元素事件
  methodItem.ownerElement.addEventListener(methodItem.eventType, listener);
  methodItem.listener = listener;
}

export default {
  reactive: {
    collectAttrRef(target: Attr, properties: ICustomElement): TRefTree {
      if (target.ownerElement === null) return {};
      if (MethodRules.OnAttributeName.test(target.nodeName) === false || MethodRules.MethodNameAttibuteValue.test(target.nodeValue) === false) return {};

      //* 绑定的方法，可多个
      const methodNames: string[] = target.nodeValue.match(GlobalMatchMethodName);
      //* 方法触发类型
      const eventType: string = target.nodeName.match(MethodRules.MethodType)[0];
      if (!eventType || !methodNames) return {};

      const refTree: TRefTree = {};

      const ownerElement: HTMLElement = target.ownerElement as HTMLElement;
      ownerElement[target.nodeName] = null; //* 清除已有方法

      for (let methodName of methodNames) {
        let listener = null;
        let params: string[] | string = methodName.match(MethodRules.MethodParams);
        let refParamsMap: Record<number, string[]> = {};
        let refParams: number = 0;
        if (params) {
          params = Parser.parseMethodParams(params[0]);
          params.forEach((param, index) => {
            if (RefRules.refItem.test(param)) {
              param = param.match(RefRules.extractRefItem)[0];
              // @ts-ignore
              params[index] = param;
              refParamsMap[index] = Transform.transformPropertyNameToArray(param);
              refParams++;
            }
          })
        } else {
          params = [];
        }

        let extractMethodName: string[] | string = methodName.match(MethodRules.MethodName);
        extractMethodName = extractMethodName ? extractMethodName[0] : null;
        const branch: TMethodBranch = {
          params,
          refParamsMap,
          refParams,
          listener,
          eventType,
          methodName: extractMethodName,
          ownerElement,
          target
        }
        //* 没有响应式的参数方法先绑定
        if (Object.keys(refParamsMap).length === 0) {
          bindMethod(branch, properties);
        } else {
          Utils.objectMerge(refTree, Ref.generateRefTreeByRefString(methodName, target, branch, "__methods"));
        }
      }

      return refTree;
    },
    setUpdateView(refTree: TRefTree, properties: ICustomElement, value, propertyNames): void {
      if (refTree.__methods === undefined) return;
      const methods: TMethodBranch[] = refTree.__methods;

      for (const method of methods) {
        bindMethod(method, properties.__OG__.properties);
      }
    }
  }
} as TModuleOptions