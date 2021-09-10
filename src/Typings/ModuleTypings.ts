import Reactive from "../Reactive";
import { ICustomElement, IElement, TReferrerElement } from "./CustomElementTypings";
import { TRefTree } from "./RefTypings";

export type TModuleHookNames = {
  //* 生命周期
  "lifeCycle.instantiate",
  "lifeCycle.connected",
  "lifeCycle.disconnected",
  "lifeCycle.adopted",
  "lifeCycle.propertyChanged",
  "lifeCycle.render",
  "lifeCycle.rendered",
  //* 响应式
  "reactive.start",
  "reactive.collecElRef",
  "reactive.collectAttrRef",
  "reactive.collectRef",
  "reactive.beforeUpdateView",
  "reactive.beforeUpdateElView",
  "reactive.beforeUpdateAttrView",
  "reactive.setUpdateView",
  "reactive.deleteUpdateView",
  "reactive.afterUpdatedElView",
  "reactive.afterUpdateAttrView",
  "reactive.afterUpdatedView",
  "reactive.clearRefTree",
  "reactive.clearElRefTree",
  "reactive.clearAttrRefTree",
  "reactive.end",
}

export type TModuleOptions = {
  lifeCycle?: {
    instantiate?: (instance: ICustomElement) => void;
    connected?: (instance: ICustomElement) => void;
    disconnected?: () => void;
    adopted?: () => void;
    propertyChanged?: () => void;
    render?: (templateString: string) => string;
    rendered?: (instance: ICustomElement) => void;
    include?: string[],
    exclude?: string[]
  },
  reactive?: {
    start?: (target: IElement | IElement[], rootEl: ICustomElement, reactiveInstance: Reactive) => void;
    collectRef?: (target: IElement | IElement[], rootEl: ICustomElement, reactiveInstance: Reactive) => TRefTree;
    collecElRef?: (target: IElement | IElement[], rootEl: ICustomElement) => TRefTree;
    collectAttrRef?: (target: Attr, rootEl: ICustomElement) => TRefTree;
    beforeUpdateView?: () => void;
    beforeUpdateElView?: () => void;
    beforeUpdateAttrView?: (attr: Attr, nodeValue: string, properties: TReferrerElement, refTree: TRefTree) => void;
    setUpdateView?: (refTree: TRefTree, value: any, properties: Record<string, any>) => void;
    deleteUpdateView?: () => void;
    afterUpdatedElView?: () => void;
    afterUpdateAttrView?: (attr: Attr, newValue: string, properties: TReferrerElement, refTree: TRefTree) => void;
    afterUpdatedView?: () => void;
    clearRefTree?: (target: TReferrerElement, isDeep: boolean) => void;
    clearElRefTree?: (target: TReferrerElement, parentNode: Element, isDeep: boolean) => void;
    clearAttrRefTree?: (target: TReferrerElement, parentNode: Element, isDeep: boolean) => void;
    end?: () => void;
  }
};