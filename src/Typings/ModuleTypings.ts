import Reactive from "../Reactive";
import { ICustomElement, IElement, TElement, TReferrerElement } from "./CustomElementTypings";
import { TRefs, TRefRecord } from "./RefTypings";

export type TModuleHookNames = {
  //* 生命周期
  "lifeCycle.instantiate";
  "lifeCycle.connected";
  "lifeCycle.disconnected";
  "lifeCycle.adopted";
  "lifeCycle.propertyChanged";
  "lifeCycle.render";
  "lifeCycle.rendered";
  //* 响应式
  "reactive.start";
  "reactive.collecElRef";
  "reactive.collectAttrRef";
  "reactive.collectRef";
  "reactive.beforeUpdateView";
  "reactive.beforeUpdateElView";
  "reactive.beforeUpdateAttrView";
  "reactive.setUpdateView";
  "reactive.setProperty";
  "reactive.updateProperty";
  "reactive.deleteUpdate";
  "reactive.afterUpdatedElView";
  "reactive.afterUpdateAttrView";
  "reactive.afterUpdatedView";
  "reactive.clearRefTree";
  "reactive.clearElRefTree";
  "reactive.clearAttrRefTree";
  "reactive.end";
};

export type TModuleOptions = {
  lifeCycle?: {
    instantiate?: (instance: ICustomElement) => void;
    connected?: (instance: ICustomElement) => void;
    disconnected?: () => void;
    adopted?: () => void;
    propertyChanged?: () => void;
    render?: (templateString: string) => string;
    rendered?: (instance: ICustomElement) => void;
    include?: string[];
    exclude?: string[];
  };
  reactive?: {
    start?: (target: IElement | IElement[], rootEl: ICustomElement, reactiveInstance: Reactive) => void;
    collectRef?: (target: IElement | IElement[], rootEl: ICustomElement, reactiveInstance: Reactive) => TRefRecord;
    collecElRef?: (target: TElement, rootEl: ICustomElement) => TRefRecord;
    collectAttrRef?: (target: Attr, rootEl: ICustomElement, ownerElement: TElement) => TRefRecord;
    beforeUpdateView?: () => void;
    beforeUpdateElView?: () => void;
    beforeUpdateAttrView?: (attr: Attr, nodeValue: string, properties: TReferrerElement, refTree: TRefRecord) => void;
    setUpdateView?: (refs: TRefs, target: any, propertyKey: string | symbol, value: any, properties: ICustomElement, receiver: any) => boolean | null;
    setProperty?: (refs: TRefs, target: any, propertyKey: string | symbol, value: any, properties: ICustomElement, receiver: any) => void;
    updateProperty?: (refs: TRefs, target: any, propertyKey: string | symbol, value: any, properties: ICustomElement, receiver: any) => void;
    deleteProperty?: () => void;
    afterUpdatedElView?: () => void;
    afterUpdateAttrView?: (attr: Attr, newValue: string, properties: ICustomElement, refTree: TRefRecord) => void;
    afterUpdatedView?: () => void;
    clearRefTree?: (target: TReferrerElement, isDeep: boolean) => void;
    clearElRefTree?: (target: TReferrerElement, parentNode: Element, isDeep: boolean) => void;
    clearAttrRefTree?: (target: TReferrerElement, parentNode: Element, isDeep: boolean) => void;
    end?: () => void;
  };
};
