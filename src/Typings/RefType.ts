export type TRefExpressionPropertyValue = {
  refs: string[],
  value: string,
  raw: string,
  refKey: string[]
}

export type TRefItemTypeEl = Array<{
  target?: Text,
  expression?: TRefExpressionPropertyValue
}>

export type TRefItem = {
  __els: TRefItemTypeEl,
  __refKeys: string[]
}

export type TRefs = {
  [key: string]: TRefItem
}