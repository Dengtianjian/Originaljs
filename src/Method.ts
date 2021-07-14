import { Methods } from "./rules";
import { IEl } from "./types/ElementType";

function parseMethodParams(name): string[] {
  return [];
}

export function bindMethods(target: IEl, methods: Record<string, Function | AsyncGeneratorFunction>): boolean {
  if (target.childNodes.length > 0) {
    Array.from(target.children).forEach((childNode) => {
      bindMethods(childNode, methods);
    });
  }
  target = target as HTMLElement | Element;

  if (target.attributes && target.attributes.length > 0) {
    const attributes: Attr[] = Array.from(target.attributes);
    for (const attrItem of attributes) {
      if (Methods.OnAttributeName.test(attrItem.name) && Methods.MethodNameAttibuteValue.test(attrItem.value)) {
        const methodNames: RegExpMatchArray = String(attrItem.value).match(new RegExp(Methods.MatchMethodName, "g"));
        if (methodNames === null) continue;

        //* 清除已有方法
        target[attrItem.name]=null;

        for (const methodNameItem of methodNames) {
          const params: string[] = parseMethodParams(methodNameItem);
          const methodName: RegExpMatchArray = methodNameItem.match(Methods.MethodName);
          if (methodName === null) continue;

          const listener = methodName[methodName[0]].bind(target, ...params);

          const type: RegExpMatchArray = attrItem.name.match(new RegExp(Methods.MethodType, "g"));
          if (type === null) continue;


        }
      }
    }
  }
  return true;
}