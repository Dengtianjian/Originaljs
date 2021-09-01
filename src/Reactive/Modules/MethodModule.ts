import { ICustomElement } from "../../Typings/CustomElementTypings";
import { TModuleOptions } from "../../Typings/ModuleTypings";
import { TRefTree } from "../../Typings/RefTreeTypings";
import { MethodRules } from "../Rules";

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

      const ownerElement: HTMLElement = target.ownerElement as HTMLElement;
      ownerElement[target.nodeName] = null; //* 清除已有方法

      for (const methodName of methodNames) {
        let listener = null;

        if (!properties[methodName]) {
          console.error(`Method ${methodName} is not define`);
          continue;
        }

        listener = function (event) {
          properties[methodName].apply(ownerElement, [
            event, target
          ]);
        }

        ownerElement.addEventListener(eventType as keyof HTMLElementEventMap, listener);
      }
    }
  }
} as TModuleOptions