export const RefRules = {
  withDotRefPropertyName: /(?<=\{) *.+(?=.*\.).+? *(?=\})/g, //* 带有点符号的引用字符串
} as {
  withDotRefPropertyName: RegExp
}