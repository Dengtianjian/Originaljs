import Module from "../Module";
import { ICustomElement, TElement } from "../Typings/CustomElementTypings";
import { TRefTree } from "../Typings/RefTreeTypings";
import Utils from "../Utils";

function updateView() {

}

function setUpdateView(target: TElement | ICustomElement | Record<string, any>, propertyKey: string, value: any, receiver: any): boolean {
  const propertiesKeyPath: string[] = target.__OG__.propertiesKeyPath;

  const propertyNames: string[] = [...propertiesKeyPath, propertyKey];
  const refTree: TRefTree = Utils.getObjectProperty(target.__OG__.refTree, propertyNames);
  let refProperties: Record<string, any> = null;
  if (propertiesKeyPath.length > 0) {
    refProperties = Utils.getObjectProperty(target.__OG__.properties, propertiesKeyPath);
  } else {
    refProperties = target.__OG__.properties;
  }
  if (typeof value === "function") {
    if (Object.prototype.toString.call(value) === "[object AsyncFunction]") {
      value.apply(target.__OG__.properties).then(res => {
        Module.useAll("reactive.setUpdateView", [refTree, refProperties, res, propertyNames]);
      }).catch(err => {
        Module.useAll("reactive.setUpdateView", [refTree, refProperties, err, propertyNames]);
      })
      value = "";
    } else {
      value = value.apply(target.__OG__.properties);
    }
  }

  Module.useAll("reactive.setUpdateView", [refTree, refProperties, value, propertyNames]);
  return true;
}

function deleteUpdateView(target: any, propertyKey: string | symbol): boolean {
  return true;
}

export default {
  updateView,
  setUpdateView,
  deleteUpdateView
}