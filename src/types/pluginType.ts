import { IElement } from "./elementType";

export type TRefTree = {
  [key: string]: TRefTree
}

export interface IPluginItem {
  collectRef?(El: IElement, rawData: object | []): TRefTree,
  updateView?(target: any, propertys: { [key: string]: any, __els: HTMLElement[], __attrs: Attr[] }, property: string, value: any): void
}

export interface IPlugins {
  [name: string]: IPluginItem
}