export const RefRules = {
  withDotRefPropertyName: /(?<=\{) *[.\W\S]+(?=[.\W\S]*\.)[.\W\S]+? *(?=\})/g,
  refItem: /\{ *[.\W\S]+ *\}/,
  extractRefItem: /(?<=\{)[.\W\S]+(?=\})/,
  variableName: /[a-zA-z_][a-zA-z0-9_\.\[\]'"]+/,
  variableItem: /\{ *[a-zA-z_][a-zA-z0-9_\.\[\]'"]* *\}/,
  extractVariableName: /(?<=\{) *[a-zA-z_][a-zA-z0-9_\.\[\]'"]+? *(?=\})/,
  expressionItem: /\{ *([.\W\S]*{ *[.\W\S]+ *}[.\W\S]+)+ *\}/g,
  extractExpression:/(?<=\{) *([.\W\S]*{ *[.\W\S]+ *}[.\W\S]+)+ *(?=\})/,
} as {
  withDotRefPropertyName: RegExp, //* 带有点符号的引用字符串
  refItem: RegExp, //* 匹配带 花括号的
  extractRefItem: RegExp, //* 匹配并且抽取
  variableName: RegExp, //* 匹配变量
  variableItem: RegExp, //* 匹配 包含 {} 的变量
  extractVariableName: RegExp, //* 从 {} 中提取
  expressionItem: RegExp, //* 表达式
  extractExpression: RegExp, //* 抽取表达式
}