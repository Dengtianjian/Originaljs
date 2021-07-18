import { IEl } from "./ElementType";
import { IProperties } from "./Properties";
import { IRefTree } from "./Ref";

export type TPluginItem = {
  [key: string]: any,
  collectRef?(target: IEl, properties: IProperties): IRefTree
}

export type TPlugins = {
  [name: string]: TPluginItem
};