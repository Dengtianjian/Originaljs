import { TAttr, TElement, TText } from "./CustomElementTypings";
import { TExpressionItem } from "./ExpressionTypings";

export type TMethodBranch = {
  branchKey: symbol,
  params: string[] | number[],
  refParamsMap: Map<number, string[]>,
  expressionParamMap: Map<number, {
    expression: string, params: string[][]
  }>,
  target: Attr,
  eventType: string,
  methodName: string,
  ownerElement: TElement,
  listener: (event: any) => void
};

export type TDynamicElementContentTypes = {
  html: 1,
  value: 2,
  is: 3
};
export type TDynamicElementBranch = {
  attr: Attr,
  target: TElement,
  refInfo: TRefInfo,
  contentType: keyof TDynamicElementContentTypes | string,
  showEl?: Element
}

export type TRefBracnhItem = {

};
export type TRefTree = {
  __els?: Map<symbol, TText>,
  __attrs?: Map<symbol, TAttr>,
  __expressions?: Map<symbol, TExpressionItem>,
  __methods?: Map<symbol, TMethodBranch>,
  __dynamicElements?: Map<symbol, TDynamicElementBranch>
}

export type TRefInfo = {
  type: string,
  expressionInfo: TExpressionItem | null,
  refPropertyNames: string[][]
}

//* 新定义
//* 该属性在模板上有引用，例如__els、__attrs的属性值
export type TRefTreePropertyBranch = {

}

//* 引用树的属性分支。
export type TReferrerPropertyRef = {
  // target: Text | Attr,
  propertyKeyMap: Map<symbol, string[] | string[][]>,
  // refTree: TRefTree,
  type: keyof TRefTree
}