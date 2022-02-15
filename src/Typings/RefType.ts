export type TRefStatementPropertyValue = {
  refs: string[],
  value: string,
  raw: string,
  refKey: string[]
}

export type TRefItemBasic = {
  target?: Text,
  statement?: TRefStatementPropertyValue
}

export type TRefItemTypeEl = TRefItemBasic;

export type TRefItemTypeFor = {
  for: {
    template: string,
    itemName: string,
    indexName: string,
    keyName: string,
    refKey: string
  }
} & TRefItemBasic;

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
  raw: string, //* 语句原字符串
  refKeyMap: Map<string, Array<string>>, //* 插值引用对应的插值key，已分割好的。user['time'] -> [user,time]
  refs: string[], //* 语句有哪些插值引用
  refsRaw: string[], //* 处理前的插值引用，包含大括号 {}
  statements: string[], //* 语句 { {user.name} + ":name" } -> {user.name} + ":name"
  statementsRaw: string[], //* 语句原本的样子 { {user.name} + ":name" } -> [{ {user.name} + ":name" }]
  executableStatements: Map<string, string>, //* 已经替换好this 可以直接执行 { {user.name} + ":name" } -> this.user.name + ":name"
  statementRefMap: Map<string, string[]> //* 语句对应的有哪些引用
}