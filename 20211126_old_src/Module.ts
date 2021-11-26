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

function useAll<T>(moduleName: keyof TModuleHookNames, args: any[] = [], callBack?: (result: any, breakForof: () => void) => void): T[] {
  const results: T[] = [];
  const moduleNames: string[] = moduleName.split(".");

  for (const moduleItem of Modules) {
    let hookFunction: Function = Utils.getObjectProperty(moduleItem, moduleNames);
    if (hookFunction === undefined) continue;

    const functionExecuteResult: any = hookFunction(...args);
    results.push(functionExecuteResult);
    if (callBack) {
      let forofBreak: boolean = false;
      callBack(functionExecuteResult, () => {
        forofBreak = true;
      });
      if (forofBreak) {
        break;
      }
    }
  }

  return results;
}

export default {
  add,
  use,
  useAll
}