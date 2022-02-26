export default {
  matchStatement: /\{[\s\S]+\}/,
  matchRefRaw: /\{\s*[\w\.\[\]\'\"]+?\s*\}/,
  extactRef: /\{(\s*[\w\.\[\]\'\"]+?)\s*\}/,
  matchStyleVariable: /o\([\s\"\']*[\w\.\[\]\'\"]+?[\s\"\']*\)/,
  extacStyleVariableRef: /(?<=o\()[\w\.\[\]\'\"]+?(?=\))/
} as {
  matchStatement: RegExp //* 匹配并且抽取表达式
  matchRefRaw: RegExp //* 匹配引用插值原始字符串
  extactRef: RegExp //* 抽取引用插值
  matchStyleVariable: RegExp //* 匹配Style标签中的 o 函数
  extacStyleVariableRef: RegExp //* 抽取Style标签中 o 函数的引用插值
}