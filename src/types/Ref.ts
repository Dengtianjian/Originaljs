import { IEl } from "./ElementType"

export type TRefTreeFors = {
  el: HTMLElement,
  templateChildNodes: Node[],
  indexName: string,
  propertyName: string,
  keyName: string,
  itemName: string
}

// export type TRefTreeBranch = {
//   [key: string]: IRefTree | any,
//   __els: TText[],
//   __attrs: TAttr[],
//   __fors?: TRefTreeFors[]
// }

export interface IRefTree {
  [key: string]: IRefTree | any,
  __els?: TText[],
  __attrs?: TAttr[],
  __fors?: TRefTreeFors[]
}

export type TAttr = Attr & {
  __og__attrs: {
    nodeRawValue: string
  }
}

export type TText = Text & {
  __og__parsed: boolean
}