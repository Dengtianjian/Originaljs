export type TConditionElItem = {
  target: HTMLElement | Element,
  conditionAttr?: Attr,
  substitute: Comment,
  parentElement: HTMLElement
};

export type TConditionItem = {
  els: TConditionElItem[]
  current: number
}