import { OGElement } from "./OGElement";
import { Methods } from "./Rules";
import { IEl } from "./types/ElementType";

function parseMethodParams(rawString: string): string[] {
  const paramsRawString: RegExpMatchArray = rawString.match(Methods.MethodParams);
  if (paramsRawString === null) return [];
  let params: string[] = paramsRawString[0].split(",");
  params.forEach(item=>{
    
  })
  return paramsRawString[0].split(",");
}

export function elBindMethod(target, methods: Record<string, Function | AsyncGeneratorFunction | any>, thisDirection: object = target) {
  target = target as HTMLElement | Element;

  if (target.attributes && target.attributes.length > 0) {
    const attributes: Attr[] = Array.from(target.attributes);
    for (const attrItem of attributes) {
      if (Methods.OnAttributeName.test(attrItem.name) && Methods.MethodNameAttibuteValue.test(attrItem.value)) {
        const methodNames: RegExpMatchArray = String(attrItem.value).match(new RegExp(Methods.MatchMethodName, "g"));
        if (methodNames === null) continue;

        //* 清除已有方法
        target[attrItem.name] = null;

        for (const methodNameItem of methodNames) {
          const params: Array<string | HTMLElement | Element | OGElement> = parseMethodParams(methodNameItem);

          const methodName: RegExpMatchArray = methodNameItem.match(Methods.MethodName);
          if (methodName === null) continue;
          if (!methods[methodName[0]]) {
            console.warn(`缺失 ${methodName[0]} 方法`);
            continue;
          }

          const listener = methods[methodName[0]].bind(thisDirection, ...params);

          const type: RegExpMatchArray = attrItem.name.match(new RegExp(Methods.MethodType, "g"));
          if (type === null) continue;

          target.addEventListener(type[0], listener);
        }
        target.removeAttribute(attrItem.name);
      }
    }
  }
}

export function bindMethods(target: IEl, methods: Record<string, Function | AsyncGeneratorFunction | any>, thisDirection: object = target): boolean {
  if (target.nodeType === 3) return false;

  if (target.childNodes.length > 0) {
    Array.from(target.children).forEach((childNode) => {
      bindMethods(childNode, methods, thisDirection);
    });
  }

  elBindMethod(target, methods, thisDirection);
  return true;
}