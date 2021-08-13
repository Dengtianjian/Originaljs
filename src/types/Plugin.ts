import { Reactive } from "../reactive";
import { IEl } from "./ElementType";
import { IProperties } from "./Properties";
import { IRefTree } from "./Ref";

export type TPluginItem = {
  [key: string]: any,
  start?(target: IEl | Node[], properties: IProperties, reactiveInstance: Reactive): void;
  collectElRef?(target: IEl | Node[], properties: IProperties): IRefTree;
  collectRef?(target: IEl | Node[], properties: IProperties): IRefTree,
  setProxy?(),
  dataUpdate?(target: any, propertyKey: string): void,
  setUpdateView?(target: IProperties, refTree: IRefTree, propertyKey: string | number, value: any): Boolean;
  deleteUpdateView?(target: IProperties, propertyKey: string | number): Boolean;
  beforeUpdateRef?(refTree: IRefTree, properties: IProperties, propertyKeyPaths: string): void;
  afterUpdateRef?(refTree: IRefTree, properties: IProperties, propertyKeyPaths: string): void;
  removeRefTree?(): void;
  removeTargetRefTree?(): void;
  end?(target: IEl | Node[], properties: IProperties, reactiveInstance: Reactive): void;
}

export type TPlugins = TPluginItem[];