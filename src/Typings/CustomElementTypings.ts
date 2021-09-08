import CustomElement from "../CustomElement";
import Reactive from "../Reactive";
import Transition from "../Transition";
import { TReferrerPropertyRef, TRefTree } from "./RefTypings";
import { ITransition, TCSSStyleDeclaration } from "./TransitionTypings";

export type TOG = {
  [key: string]: any,
  reactive: Reactive,
  rootEl: IElement,
  refTree: TRefTree,
  propertiesKeyPath: string[],
  properties: Record<string, any>
}

export interface ICustomElement extends HTMLElement {
  __OG__: {
    transitions: Record<string, ITransition>,
    el: IElement,
    slots: Record<string, Node[]>,
    props: string[]
  } & TOG
  connected(): void;
  disconnected(): void;
  adopted(): void;
  rendered(): void;
  propertyChanged(name: string, newValue: unknown, oldValue: unknown): void;
  render(template: string | Node | NodeList | Node[]): Promise<boolean>;
  updateProperty(propertyName: string, newValue: any): void;
  revokeObserve(target: string | IElement, isDeep: boolean): void;
  transition(transitionName: string, initStyles?: TCSSStyleDeclaration): Transition | undefined;
  useTransitionPreset(presetName: string, key?: string): Transition
}

export type TElement = {
  __OG__: TOG
} & Element & HTMLElement & Node & ParentNode & ICustomElement;
export interface IElement extends Element {
  __OG__: TOG
}

export type TReferrerRefInfo = {
  [key: string | symbol | number]: any,
  properties: ICustomElement,
  refTree: TRefTree,
  ref: TReferrerPropertyRef
}
export type TText = {
  __OG__: TReferrerRefInfo
} & Text

export type TAttr = {
  __OG__: TReferrerRefInfo
} & Attr

export type TReferrerElementOGProperties<T = {}> = {
  hasRefs?: boolean,
  properties: ICustomElement,
  refTree: TRefTree,
  refs: Record<keyof TRefTree, Map<symbol, string[] | string[][]>>,
} & T
export type TReferrerElement = {
  __OG__: TReferrerElementOGProperties
}