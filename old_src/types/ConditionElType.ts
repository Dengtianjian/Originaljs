export type TConditionElItem = {
  target: HTMLElement | Element,
  conditionAttr?: Attr,
  shadow: Comment,
  parentElement: HTMLElement
};

export type TConditionItem = {
  els: TConditionElItem[]
  current: number
}