import { IEl } from "./ElementType";
import { IProperties } from "./Properties";
import { IRefTree } from "./Ref";

export type TPluginItem = {
  [key: string]: any,
  collectRef?(target: IEl | Node[], properties: IProperties): IRefTree,
  setUpdateView?(target: IProperties, refTree: IRefTree, propertyKey: string | number, value: any): Boolean;
  deleteUpdateView?(target: IProperties, propertyKey: string | number): Boolean;
}

export type TPlugins = {
  [name: string]: TPluginItem
};