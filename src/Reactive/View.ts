import Module from "../Module";
import { ICustomElement } from "../Typings/CustomElementTypings";
import { TRefs } from "../Typings/RefTypings";

function setUpdateView(refs: TRefs, value: any, properties: ICustomElement, propertyKey: string | symbol): boolean {
  if (typeof value === "function") {
    if (Object.prototype.toString.call(value) === "[object AsyncFunction]") {
      value.apply(properties).then(res => {
        Module.useAll("reactive.setUpdateView", [refs, res, properties, propertyKey]);
      }).catch(err => {
        Module.useAll("reactive.setUpdateView", [refs, err, properties, propertyKey]);
      })
      // value = "";
      return true;
    } else {
      value = value.apply(properties);
    }
  }
  Module.useAll("reactive.setUpdateView", [refs, value, properties, propertyKey]);
  return true;
}

function deleteUpdateView(target: any, propertyKey: string | symbol): boolean {
  return true;
}

export default {
  setUpdateView,
  deleteUpdateView
}