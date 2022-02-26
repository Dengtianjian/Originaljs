import CustomElement from "../CustomElement";
import { TRefItem, TRefs } from "./RefType";

export type TModuleOptions = {
  name: string,
  collectRefs?(target: Node | Element, root: CustomElement): null | TRefs,
  updateView?(refItem: TRefItem, refKeys: string[], target: any, data: CustomElement): null,
  set?(refKeys: string[], target: any, data: CustomElement): void,
  deleteProperty?(ref: TRefItem, target: any, propertyKey: string): void;
}