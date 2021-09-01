import { TElement } from "./CustomElementTypings";
import { TExpressionItem } from "./ExpressionTypings";

export type TMethodBranch = {
  params: string[],
  refParamsMap: Record<number, string[]>,
  refParams: number,
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