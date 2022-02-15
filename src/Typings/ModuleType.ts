import { TRefs } from "./RefType";

export type TModuleOptions = {
  collectRefs(target: Node | Node[]): null | TRefs
}