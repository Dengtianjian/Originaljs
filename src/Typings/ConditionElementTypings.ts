import { TElement } from "./CustomElementTypings";
import { TExpressionInfo } from "./RefTypings";

export type TConditionElItem = {
  target: TElement,
  conditionAttr?: Attr,
  shadow: Comment,
  expressionInfo: TExpressionInfo
};

export type TConditionItem = {
  els: TConditionElItem[]
  current: number,
  parentNode: ParentNode
}