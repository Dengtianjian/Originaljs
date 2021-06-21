
export type TRefTree = {
  [key: string]: TRefTree
}

export interface IPluginItem {
  collectRef?(El: HTMLElement): TRefTree
}

export interface IPlugins {
  [name: string]: IPluginItem
}