import CustomElement from "../CustomElement";
import Reactive from "../Reactive";
import Transition from "../Transition";
import { TReferrerPropertyRef, TRefMap, TRefs, TRefRecord } from "./RefTypings";
import { ITransition, TCSSStyleDeclaration } from "./TransitionTypings";

export type TOG = {
  [key: string]: any;
  reactive: Reactive;
  rootEl: IElement;
  propertiesKeyPath: string[];
  properties: Record<string, any>;
  refs: TRefs,
  refMap: TRefMap
};

export interface ICustomElement extends HTMLElement {
  __OG__: {
    transitions: Record<string, ITransition>;
    el: IElement;
    slots: Record<string, Node[]>;
    props: string[];
    refMap: TRefMap
  } & TOG;
  connected(): void;
  disconnected(): void;
  adopted(): void;
  rendered(): void;
  propertyChanged(name: string, newValue: unknown, oldValue: unknown): void;
  render(template: string | Node | NodeList | Node[]): Promise<boolean>;
  updateProperty(propertyName: string, newValue: any): void;
  revokeObserve(target: string | IElement, isDeep: boolean): void;
  transition(transitionName: string, initStyles?: TCSSStyleDeclaration): Transition | undefined;
  useTransitionPreset(presetName: string, key?: string): Transition;
}

export type TElement<T = {}> = {
  __OG__: TOG & T;
} & Element &
  HTMLElement &
  Node &
  ParentNode &
  ICustomElement;
export interface IElement extends Element {
  __OG__: TOG;
}

export type TReferrerRefInfo = {
  [key: string | symbol | number]: any;
  properties: ICustomElement;
  refTree: TRefRecord;
  ref: TReferrerPropertyRef;
};
export type TText = {
  __OG__: TReferrerRefInfo;
} & Text;

export type TAttr = {
  __OG__: TReferrerRefInfo;
} & Attr;

export type TReferrerElementOGProperties<T = {}> = {
  hasRefs?: boolean;
  updateRef?: boolean;
  skipAttrCollect?: boolean;
  skipChildNodesCollect?: boolean;
  properties: ICustomElement;
  refMap: TRefMap;
  refs: Record<keyof TRefRecord, Map<symbol, string[] | string[][]>>;
} & T;
export type TReferrerElement = {
  __OG__: TReferrerElementOGProperties;
};