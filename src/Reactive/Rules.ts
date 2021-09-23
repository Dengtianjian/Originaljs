export const RefRules: {
  withDotRefPropertyName: RegExp, //* 带有点符号的引用字符串
  refItem: RegExp, //* 匹配带 花括号的
  matchRefItem:RegExp, //* 匹配整个字符串
  extractRefItem: RegExp, //* 匹配并且抽取
  variableName: RegExp, //* 匹配变量
  variableItem: RegExp, //* 匹配 包含 {} 的变量
  extractVariableName: RegExp, //* 从 {} 中提取
  expressionItem: RegExp, //* 表达式
  extractExpression: RegExp, //* 抽取表达式
} = {
  withDotRefPropertyName: /(?<=\{) *[.\W\S]+(?=[.\W\S]*\.)[.\W\S]+? *(?=\})/g,
  refItem: /\{ *[.\W\S]+ *\}/,
  matchRefItem:/^\{ *[.\W\S]+ *\}$/,
  extractRefItem: /(?<=\{)[.\W\S]+(?=\})/,
  variableName: /[a-zA-z_][a-zA-z0-9_\.\[\]'"]+/,
  variableItem: /\{ *[a-zA-z_][a-zA-z0-9_\.\[\]'"]* *\}/,
  extractVariableName: /(?<=\{) *[a-zA-z_][a-zA-z0-9_\.\[\]'"]+? *(?=\})/,
  expressionItem: /^\{ *([.\W\S]*{ *[.\W\S]+ *}[.\W\S]+)+ *\}$/g,
  extractExpression: /(?<=\{)([.\W\S]+?)(?=\})/,
}

export const MethodRules: {
  OnAttributeName: RegExp, //* 绑定方法的属性名 onclick onmouseover ...
  MethodNameAttibuteValue: RegExp, //* 匹配属性值是否绑定了方法
  MatchMethodName: RegExp, //* 匹配方法名称
  MethodName: RegExp, //* 匹配方法名称，且后面必须带有参数
  MethodType: RegExp, //* 匹配方法类型
  MethodParams: RegExp, //* 匹配参数
} = {
  OnAttributeName: /^on[a-z]+$/,
  MethodNameAttibuteValue: /^\w+(\(\))?/,
  MatchMethodName: /\w+(\(.+\))?(?=;)?/,
  MethodName: /\w+(?=\(.+\))?/,
  MethodType: /(?<=on)\w+/,
  MethodParams: /(?<=\().+(?=\))/
}