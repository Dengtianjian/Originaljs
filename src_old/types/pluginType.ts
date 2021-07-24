import { IElement } from "./elementType";
import { IReactiveItem } from "./reactiveType";

export type TRefTree = {
  [key: string]: TRefTree,
}

export type TForItem = {
  el: IElement,
  indexName: string,
  itemName: string,
  keyName: string,
  propertyName: string,
  templateChildNodes: HTMLElement[] & Node[]
}

export type TPropertys = {
  [key: string]: any,
  __og_fors?: Array<TForItem>,
  __els?: HTMLElement,
  __attrs?: Array<Attr & { __og_attrs: any }>
}

export interface IPluginItem {
  collectRef?(El: IElement, rawData: object | []): TRefTree,
  setUpdateView?(target: IReactiveItem, propertys: TPropertys, property: PropertyKey, value: any, rawData: object): Boolean,
  deleteUpdateView?(target: IReactiveItem, refs: TRefTree, propertyKey: PropertyKey): Boolean
}

export interface IPlugins {
  [name: string]: IPluginItem
}