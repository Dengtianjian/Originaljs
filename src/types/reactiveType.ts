import { Reactive } from "../runtime";

export interface IReactiveItem {
  [key: string]: any,
  __og_root: Reactive,
  __og_stateKey: string
}