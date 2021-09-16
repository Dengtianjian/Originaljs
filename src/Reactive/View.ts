import { ICustomElement } from "../Typings/CustomElementTypings";
import { TRefs } from "../Typings/RefTypings";
import Transform from "./Transform";

function setUpdateView(refs: TRefs, target: any, propertyKey: string | symbol, value: any, properties: ICustomElement): void {
  refs.__texts.forEach(refItem => {
    refItem.textContent = Transform.transformObjectToString(value) as string;
  })
}

export default {
  setUpdateView
}