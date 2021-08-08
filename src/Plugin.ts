import { TPluginItem, TPlugins } from "./types/Plugin";

const Plugins: TPlugins = [];
const RegisteredPluginsName: Record<string, number> = {};

export function register(name: string, plugin: TPluginItem): void {
  if (RegisteredPluginsName[name] !== undefined) return;
  Plugins.push(plugin);
  RegisteredPluginsName[name] = Plugins.length - 1;
}

export function use(name: string): TPluginItem {
  if (RegisteredPluginsName[name] === undefined) {
    console.error("The plugin( " + name + " ) does not exist.");
    return;
  }
  return Plugins[RegisteredPluginsName[name]];
}

export function all(): TPlugins {
  return Plugins;
}

export function useAll<T>(hookName: keyof TPluginItem, args: any[] = []): T[] {
  const plugins: TPlugins = all();
  const results: T[] = [];
  for (const pluginItem of plugins) {
    if (pluginItem[hookName] === undefined) continue;
    results.push(pluginItem[hookName](...args));
  }
  return results;
}

export default {
  register,
  use,
  all,
  useAll
}