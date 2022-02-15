export default {
  matchStatement: /\{[\s\S]+\}/,
  matchRefRaw: /\{\s*[\w\.\[\]\'\"]+?\s*\}/,
  extactRef: /\{(\s*[\w\.\[\]\'\"]+?)\s*\}/
} as {
  matchStatement: RegExp //* 匹配并且抽取表达式
  matchRefRaw: RegExp //* 匹配引用插值原始字符串
  extactRef: RegExp //* 抽取引用插值
}