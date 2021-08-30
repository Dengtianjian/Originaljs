import Reactive from ".";
import { ICustomElement } from "../Typings/CustomElementTypings";
import { TRefTree } from "../Typings/RefTreeTypings";
import Utils from "../Utils";
import Transform from "./Transform";
import View from "./View";

function setProxy(refTree: TRefTree, properties: ICustomElement, reactiveInstance: Reactive, paths: number[] & string[] = []): void {
  for (const branchName in refTree) {
    if (properties[branchName] === undefined || typeof properties[branchName] !== "object") continue;
    paths.push(branchName);

    setProxy(refTree[branchName], properties[branchName], reactiveInstance, paths);

    if (properties[branchName].hasOwnProperty('__OG__')) {
      paths.pop();
      continue;
    }

    Utils.defineOGProperty(properties[branchName], {
      propertiesKeyPath: [...paths],
      reactive: reactiveInstance,
      refTree: reactiveInstance.refTree,
      properties: reactiveInstance.properties
    });

    properties[branchName] = new Proxy(properties[branchName], {
      set(...rest): boolean {
        Reflect.set(...rest);
        return View.setUpdateView(...rest);
      },
      deleteProperty(...rest): boolean {
        Reflect.deleteProperty(...rest);
        return View.deleteUpdateView(...rest);
      }
    })

    paths.pop();
  }
}

export default {
  setProxy
}