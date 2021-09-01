import { TElement } from "./CustomElementTypings";
import { TExpressionItem } from "./ExpressionTypings";

export type TMethodBranch = {
  params: string[],
  refParamsMap: Map<number, string[]>,
  expressionParamMap: Map<number, {
    expression: string, params: string[]
  }>,
  target: Attr,
  eventType: string,
  methodName: string,
  ownerElement: Element,
  listener: (event: any) => void
};

export type TDynamicElementContentTypes = {
  html: 1,
  value: 2,
  is: 3
};
export type TDynamicElementBranch = {
  attr: Attr,
  target: TElement,
  rawTemplate: string,
  contentType: keyof TDynamicElementContentTypes | string
}

export type TRefTree = {
  __els?: TElement[],
  __attrs?: Attr[],
  __expressions?: TExpressionItem[],
  __methods?: TMethodBranch[],
  __dynamicElements?: TDynamicElementBranch[]
}