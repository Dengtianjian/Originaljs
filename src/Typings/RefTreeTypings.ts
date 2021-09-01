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

export type TRefTree = {
  __els?: TElement[],
  __attrs?: Attr[],
  __expressions?: TExpressionItem[],
  __methods?: TMethodBranch[]
}