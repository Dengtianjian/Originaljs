import { TReferrerPropertyRef } from "./RefTypings";

export type TExpressionItem = {
  target: Text | Attr,
  expression: string,
  refPropertyNames: string[][] | string[]
}