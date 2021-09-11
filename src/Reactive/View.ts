import Module from "../Module";
import { ICustomElement } from "../Typings/CustomElementTypings";
import { TRefs } from "../Typings/RefTypings";

function setUpdateView(refs: TRefs, value: any, properties: ICustomElement): boolean {
  if (typeof value === "function") {
    if (Object.prototype.toString.call(value) === "[object AsyncFunction]") {
      value.apply(properties).then(res => {
        Module.useAll("reactive.setUpdateView", [refs, res, properties]);
      }).catch(err => {
        Module.useAll("reactive.setUpdateView", [refs, err, properties]);
      })
      // value = "";
      return true;
    } else {
      value = value.apply(properties);
    }
  }
  Module.useAll("reactive.setUpdateView", [refs, value, properties]);
  return true;
}

function deleteUpdateView(target: any, propertyKey: string | symbol): boolean {
  return true;
}

export default {
  setUpdateView,
  deleteUpdateView
}