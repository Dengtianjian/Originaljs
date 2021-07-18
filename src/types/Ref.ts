export type TRefTreeBranch = {
  [key: string]: IRefTree | any,
  __els: Text[],
  __attrs: Attr[]
}

export interface IRefTree {
  [key: string]: TRefTreeBranch | any,
}

export type TAttr = Attr & {
  __og__attrs: {
    nodeRawValue: string
  }
}