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

export type TExpressionInfo = {
  raw: string,
  refKeyMap: Map<string, Array<string>>,
  refs: string[],
  refsRaw: string[],
  statements: string[],
  statementsRaw: string[],
  executableStatements: Map<string, string>,
  statementRefMap: Map<string, string[]>
}