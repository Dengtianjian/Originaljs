import { TElement } from "./CustomElementTypings";

export type TConditionElItem = {
  target: TElement,
  conditionAttr?: Attr,
  shadow: Comment
};

export type TConditionItem = {
  els: TConditionElItem[]
  current: number,
  parentNode: ParentNode
}