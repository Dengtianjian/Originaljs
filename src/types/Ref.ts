export type TRefTreeBranch = {
  [key: string]: IRefTree | any,
  __els: Text[],
  __attrs: Attr[]
}

export interface IRefTree {
  [key: string]: TRefTreeBranch | any,
}