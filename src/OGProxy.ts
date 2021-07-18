import { Reactive } from "./reactive";
import { IProperties } from "./types/Properties";
import { IRefTree } from "./types/Ref";
import { deleteUpdateView, setUpdateView } from "./View";

export function setProxy(refTree: IRefTree, properties: IProperties, reactiveInstance: Reactive, paths: string[] = []): void {
  for (const branchName in refTree) {
    if (Object.prototype.hasOwnProperty.call(refTree, branchName)) {
      paths.push(branchName);

      if (!(typeof properties[branchName] === "object" && properties[branchName] !== null && properties[branchName] !== undefined)) continue;
      setProxy(refTree[branchName], properties[branchName], reactiveInstance);

      if (properties[branchName].hasOwnProperty("__og__reactive")) continue;

      Object.defineProperty(properties[branchName], "__og__propertiesPath", {
        value: paths,
        writable: false,
        configurable: false,
        enumerable: false
      });
      Object.defineProperty(properties[branchName], "__og__reactive", {
        value: reactiveInstance,
        writable: false,
        configurable: false,
        enumerable: false
      });

      properties[branchName] = new Proxy(properties[branchName], {
        set(target: any, propertyKey: string, value: any, receiver: any): boolean {
          Reflect.set(target, propertyKey, value, receiver);
          return setUpdateView(target, propertyKey, value, receiver);
        },
        deleteProperty(target: any, propertyKey: PropertyKey): boolean {
          Reflect.deleteProperty(target, propertyKey);
          return deleteUpdateView(target, propertyKey);
        }
      })

      paths.pop();
    }
  }
}