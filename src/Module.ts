import { TModuleHookNames, TModuleOptions } from "./Typings/ModuleTypings";
import Utils from "./Utils";

const Modules: TModuleOptions[] = [];
const AddedModuleMap: Record<string, number> = {};

function add(name: string, options: TModuleOptions): void {
  if (AddedModuleMap[name] !== undefined) return;
  Modules.push(options);
  AddedModuleMap[name] = Modules.length - 1;
}

function use(name: string): TModuleOptions {
  if (AddedModuleMap[name] === undefined) {
    console.error("The module( " + name + " ) does not exist.");
    return;
  }
  return Modules[AddedModuleMap[name]];
}

function useAll<T>(moduleName: keyof TModuleHookNames, args: any[] = []): T[] {
  const results: T[] = [];
  const moduleNames: string[] = moduleName.split(".");

  for (const moduleItem of Modules) {
    let hookFunction: Function = Utils.getObjectProperty(moduleItem, moduleNames);
    if (hookFunction === undefined) continue;

    results.push(hookFunction(...args));
  }

  return results;
}

export default {
  add,
  use,
  useAll
}