import { ICustomElement } from "../../Typings/CustomElementTypings";
import { TModuleOptions } from "../../Typings/ModuleTypings";
import { TRefTree } from "../../Typings/RefTreeTypings";
import { MethodRules, RefRules } from "../Rules";
import Parser from "../Parser";
import Utils from "../../Utils";
import Ref from "../Ref";

const GlobalMatchMethodName: RegExp = new RegExp(MethodRules.MatchMethodName, "g");

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
        if (params) {
          Utils.objectMerge(refTree, Ref.generateRefTreeByRefString(params[0], target, {}, "__methods"));

          params = Parser.parseMethodParams(params[0]);
        } else {
          params = [];
        }

        methodName = methodName.match(MethodRules.MethodName)[0];

        if (!properties[methodName]) {
          console.error(`Method ${methodName} is not define`);
          continue;
        }

        listener = function (event) {
          properties[methodName].apply(ownerElement, [...params, event, ownerElement
          ]);
        }

        //* 监听元素事件
        ownerElement.addEventListener(eventType as keyof HTMLElementEventMap, listener);
      }

      return refTree;
    },
    setUpdateView(refTree): void {
      // console.log(refTree);

    }
  }
} as TModuleOptions