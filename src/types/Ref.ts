import { IEl } from "./ElementType"

export type TRefTreeBranch = {
  [key: string]: IRefTree | any,
  __els: TText[],
  __attrs: TAttr[],
  __fors: Array<{
    el: HTMLElement,
    templateChildNodes: Node[],
    indexName: string,
    propertyName: string,
    keyName: string,
    itemName: string
  }>
}

export interface IRefTree {
  [key: string]: TRefTreeBranch | any,
}

export type TAttr = Attr & {
  __og__attrs: {
    nodeRawValue: string
  }
}

export type TText = Text & {
  __og__parsed: boolean
}