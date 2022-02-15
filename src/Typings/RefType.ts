export type TRefExpressionPropertyValue = {
  refs: string[],
  value: string,
  raw: string,
  refKey: string[]
}

export type TRefItemTypeEl = {
  target?: Text,
  expression?: TRefExpressionPropertyValue
};

export type TRefItemTypeFor = {
  target?: Element,
  expression?: TRefExpressionPropertyValue,
  for: {
    template: string,
    itemName: string,
    indexName: string,
    keyName: string,
    refKey: string
  }
};

export type TRefItemKeys = {
  __els: "__els",
  __for: "__for"
}

export type TRefItem = {
  __els: TRefItemTypeEl[],
  __for: TRefItemTypeFor[],
  __refKeys: string[]
}

export type TRefs = {
  [key: string]: TRefItem
}

export type TStatement = {
  raw: string,
  refKeyMap: Map<string, Array<string>>,
  refs: string[],
  refsRaw: string[],
  statements: string[],
  statementsRaw: string[],
  executableStatements: Map<string, string>,
  statementRefMap: Map<string, string[]>
}