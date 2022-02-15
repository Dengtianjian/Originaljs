import { TRefs } from "./RefType";

export type TModuleOptions = {
  collectRefs(target: Node | Element): null | TRefs
}