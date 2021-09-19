import Module from "../Module";
import { ICustomElement } from "../Typings/CustomElementTypings";
import { TRefs } from "../Typings/RefTypings";

function setUpdateView(refs: TRefs, target: any, propertyKey: string | symbol, value: any, properties: ICustomElement, receiver: any): void {
  Module.useAll("reactive.setUpdateView", Array.from(arguments));
}

export default {
  setUpdateView
}