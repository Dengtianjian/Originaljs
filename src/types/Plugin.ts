import { IEl } from "./ElementType";
import { IProperties } from "./Properties";
import { IRefTree } from "./Ref";

export type TPluginItem = {
  [key: string]: any,
  collectRef?(target: IEl, properties: IProperties): IRefTree,
  setUpdateView?(target: IProperties, refTree: IRefTree, propertyKey: string | number, value: any): Boolean;
}

export type TPlugins = {
  [name: string]: TPluginItem
};