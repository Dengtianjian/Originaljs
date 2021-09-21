import { TAttr, TElement, TText } from "./CustomElementTypings";
import { TExpressionItem } from "./ExpressionTypings";

export type TMethodBranch = {
  mapKey: symbol,
  params: string[] | number[],
  refParamsMap: Map<number, TExpressionInfo>,
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
  target: Attr,
  ownerElement: TElement,
  expressionInfo: TExpressionInfo,
  contentType: keyof TDynamicElementContentTypes | string,
  showEl?: Element
}

export type TForElementItem = {
  target: TElement,
  expressionInfo: TExpressionInfo,
  for: {
    indexName: string,
    itemName: string,
    keyName: string,
    template: string,
    propertyName: string,
    els: Map<string, Element | ChildNode>,
    propertyKeyString: string
  }
}

export type TMethodRef = {
  expressionInfo: TExpressionInfo,
  ownerElement: TElement,
  mapKey: symbol
}

export type TRefBracnhItem = {

};
export type TRefTree = {
  __els?: Map<symbol, TText>,
  __attrs?: Map<symbol, TAttr>,
  __expressions?: Map<symbol, TExpressionItem>,
  __methods?: Map<symbol, TMethodBranch>,
  __dynamicElements?: Map<symbol, TDynamicElementBranch>,
  __fors?: Map<symbol, TForElementItem>
}
export type TRefs = {
  __els?: Map<symbol, TText>,
  __attrs?: Map<symbol, {
    target: TAttr,
    expressionInfo: TExpressionInfo
  }>,
  __expressions?: Map<symbol, TExpressionItem>,
  __methods?: Map<symbol, TMethodRef>,
  __dynamicElements?: Map<symbol, TDynamicElementBranch>,
  __fors?: Map<symbol, TForElementItem>,
  __texts?: Map<symbol, {
    target: TText,
    expressionInfo: TExpressionInfo
  }>,
}
export type TRefMap = Map<string, TRefs>;
export type TRefRecord = Record<string, TRefs>;

export type TRefInfo = {
  type: string,
  expressionInfo: TExpressionItem | null,
  refPropertyNames: string[][]
}

export type TExpressionInfo = {
  propertyKeys: string[][],
  expression: string
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