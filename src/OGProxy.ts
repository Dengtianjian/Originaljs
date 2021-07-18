import { Reactive } from "./reactive";
import { IProperties } from "./types/Properties";
import { IRefTree } from "./types/Ref";

export function setProxy(refTree: IRefTree, properties: IProperties, reactiveInstance: Reactive, paths: string[] = []): void {
  for (const branchName in refTree) {
    if (Object.prototype.hasOwnProperty.call(refTree, branchName)) {
      paths.push(branchName);

      if (!(typeof properties[branchName] === "object" && properties[branchName] !== null && properties[branchName] !== undefined)) continue;
      setProxy(refTree[branchName], properties[branchName], reactiveInstance);

      if (properties[branchName].hasOwnProperty("__og__")) continue;

      Object.defineProperty(properties[branchName], "__og__propertiesPath", {
        value: paths,
        writable: false,
        configurable: false,
        enumerable: false
      });
      Object.defineProperty(properties[branchName], "__og__", {
        value: reactiveInstance,
        writable: false,
        configurable: false,
        enumerable: false
      });

      properties[branchName] = new Proxy(properties[branchName], {
        set(target: any, propertyKey: string | symbol, value: any, receiver: any): boolean {
          Reflect.set(target, propertyKey, value, receiver);
          return true;
        },
        defineProperty(target: any, propertyKey: string | symbol, attributes: PropertyDescriptor): boolean {
          Reflect.defineProperty(target, propertyKey, attributes);
          return true;
        },
        deleteProperty(target: any, propertyKey: PropertyKey): boolean {
          Reflect.deleteProperty(target, propertyKey);
          return true;
        }
      })

      paths.pop();
    }
  }
}