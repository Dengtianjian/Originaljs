export const VariableName: RegExp = new RegExp('[a-zA-z_][a-zA-z0-9_\\.\\[\\]]'); //* 获取变量
export const VariableItem: RegExp = new RegExp(`\\{ *[a-zA-z_][a-zA-z0-9_\\.\\[\\]]+ *\\}`); //* 获取 包含 {} 的变量
export const ExtractVariableName: RegExp = /(?<=\{) *[a-zA-z_][a-zA-z0-9_\.\[\]]+? *(?=\})/; //* 从 {} 中提取