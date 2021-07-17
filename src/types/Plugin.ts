import { IEl } from "./ElementType";
import { IProperties } from "./Properties";

export type TPluginItem = {
  collectRef?(target: IEl, properties: IProperties): void
}