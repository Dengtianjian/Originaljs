import { TElement } from "./CustomElementTypings";
import { TExpressionItem } from "./ExpressionTypings";

export type TRefTree = {
  __els?: TElement[],
  __attrs?: Attr[],
  __expressions?: TExpressionItem[]
}