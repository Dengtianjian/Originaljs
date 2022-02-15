import CustomElement from "../CustomElement";
import { TRefs } from "./RefType";

export type TModuleOptions = {
  collectRefs(target: Node | Element, root: CustomElement): null | TRefs
}