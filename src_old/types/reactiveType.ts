import { Reactive } from "../";

export interface IReactiveItem {
  [key: string]: any,
  __og_root: Reactive,
  __og_stateKey: string
}

export interface IProperties {
  [key: string]: any
}