export const Methods: Record<string, RegExp> = {
  OnAttributeName: /^on[a-z]+$/,
  MethodNameAttibuteValue: /^\w+(\(\))?/,
  MatchMethodName: /\w+(\(.+\))?;?/,
  MethodName: /\w+(?=\(.+\))?/,
  MethodType: /(?<=on)\w+/,
  MethodParams: /(?<=\().+(?=\))/
}

export const Ref: Record<string, RegExp> = {
  Item: /\{ *.+ *\}/, //* 匹配带 花括号的
  VariableName: /[a-zA-z_][a-zA-z0-9_\.\[\]]+/, //* 匹配变量
  variableItem: /\{ *[a-zA-z_][a-zA-z0-9_\.\[\]]+ *\}/, //* 匹配 包含 {} 的变量
  ExtractVariableName: /(?<=\{) *[a-zA-z_][a-zA-z0-9_\.\[\]]+? *(?=\})/ //* 从 {} 中提取

}