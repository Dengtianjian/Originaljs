import { IElement } from "./elementType";

export type TRefTree = {
  [key: string]: TRefTree
}

export interface IPluginItem {
  collectRef?(El: IElement): TRefTree,
  updateView(El){

}
}

export interface IPlugins {
  [name: string]: IPluginItem
}