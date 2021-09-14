import Module from "../Module";
import { ICustomElement } from "../Typings/CustomElementTypings";
import { TRefs } from "../Typings/RefTypings";

function setUpdateView(refs: TRefs, target: any, propertyKey: symbol | string, value: any, properties): boolean {
  if (typeof value === "function") {
    if (Object.prototype.toString.call(value) === "[object AsyncFunction]") {
      value.apply(properties).then(res => {
        Module.useAll("reactive.setUpdateView", [refs, target, propertyKey, value, properties], (result, breakForof) => {
          if (result === true) breakForof();
        });
      }).catch(err => {
        Module.useAll("reactive.setUpdateView", [refs, target, propertyKey, value, properties], (result, breakForof) => {
          if (result === true) breakForof();
        });
      })
      // value = "";
      return true;
    } else {
      value = value.apply(properties);
    }
  }
  Module.useAll("reactive.setUpdateView", [refs, target, propertyKey, value, properties], (result, breakForof) => {
    if (result === true) breakForof();
  });
  return true;
}

function deleteUpdateView(target: any, propertyKey: string | symbol): boolean {
  return true;
}

export default {
  setUpdateView,
  deleteUpdateView
}