import { propertyNamesToPath } from "./Parser";
import Plugin from "./Plugin";
import { getPropertyData } from "./Property";
import { Reactive } from "./reactive";
import { IProperties } from "./types/Properties";
import { IRefTree } from "./types/Ref";
import Utils, { defineOGProperty } from "./Utils";
import { deleteUpdateView, setUpdateView } from "./View";

export function setProxy(refTree: IRefTree, properties: IProperties, reactiveInstance: Reactive, paths: string[] = []): void {
  for (const branchName in refTree) {
    if (refTree.hasOwnProperty(branchName)) {
      if (!(typeof properties[branchName] === "object" && properties[branchName] !== undefined)) continue;
      paths.push(branchName);

      setProxy(refTree[branchName], properties[branchName], reactiveInstance, paths);

      if (properties[branchName].hasOwnProperty("__og__")) {
        paths.pop();
        continue;
      };

      defineOGProperty(properties[branchName], {
        propertiesPath: propertyNamesToPath(paths),
        reactive: reactiveInstance,
        refTree: reactiveInstance.refTree,
        properties: reactiveInstance.properties
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
      });

      paths.pop();
    }
  }
}

// TODO 深层对象，多层代理问题，上一层不应该是代理对象
export function revokeByRefTree(refTree: IRefTree, properties: IProperties): void {
  for (const branchName in refTree) {
    if (refTree.hasOwnProperty(branchName)) {
      const branch: IRefTree = refTree[branchName];
      if (branch.__has) {
        let deepCopyData = Utils.deepCopy(properties[branchName]);
        delete properties[branchName];
        properties[branchName] = deepCopyData;
      } else {
        revokeByRefTree(branch, properties[branchName]);
      }
    }
  }
}