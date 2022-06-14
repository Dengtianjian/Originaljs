import { TModuleOptions } from "../Typings/ModuleType";
import Obj from "../Utils/Obj";

const Modules: TModuleOptions[] = [];
const AddedModuleMap: Record<string, number> = {};
const AddedModuleOrderMap: Record<string, TModuleOptions> = {};

/**
 * 注册添加模块
 * @param name string 模块标识符
 * @param options TModuleOptions 模块选项
 * @returns void
 */
function add(options: TModuleOptions): void {
  if (AddedModuleMap[options.name] !== undefined) return;
  Modules.push(options);
  let index: number = Modules.length - 1;
  AddedModuleMap[options.name] = index;
  AddedModuleOrderMap[index] = options;
}

/**
 * 使用模块
 * @param name string 模块标识符
 * @returns TModuleOptions 模块选项
 */
function use(name: string): TModuleOptions {
  if (AddedModuleMap[name] === undefined) {
    throw new Error("The module( " + name + " ) does not exist.");
  }
  return Modules[AddedModuleMap[name]];
}

/**
 * 执行全部模块的指定钩子
 * @param hookname 模块钩子
 * @param args string[] 参数
 * @param callBack 回调函数
 * @returns any
 */
function useAll<T>(hookName: keyof TModuleOptions, args: any[] | IArguments = [], callBack?: (result: T, breakForof: () => void) => void): T[] {
  const results: T[] = [];

  for (const index in AddedModuleOrderMap) {
    const moduleItem = AddedModuleOrderMap[index];
    let hookFunction: Function = moduleItem[hookName] as Function;
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