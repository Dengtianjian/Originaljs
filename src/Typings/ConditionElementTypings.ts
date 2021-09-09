export type TConditionElItem = {
  target: HTMLElement | Element,
  conditionAttr?: Attr,
  shadow: Comment
};

export type TConditionItem = {
  els: TConditionElItem[]
  current: number,
  parentNode: ParentNode
}