import { TPluginItem, TPlugins } from "./types/Plugin";

const Plugins: Record<string, TPluginItem> = {};

export function register(name: string, plugin: TPluginItem): void {
  Plugins[name] = plugin;
}

export function use(name: string): TPluginItem {
  if (!Plugins.hasOwnProperty(name)) {
    console.error("The plugin( " + name + " ) does not exist.");
    return;
  }
  return Plugins[name];
}

export function all(): Record<string, TPluginItem> {
  return Plugins;
}

export function useAll<T>(hookName: keyof TPluginItem, args: any[] = []): T[] {
  const plugins: TPlugins = all();
  const results: T[] = [];
  for (const pluginName in plugins) {
    if (plugins.hasOwnProperty(pluginName)) {
      if (plugins[pluginName][hookName]) {
        results.push(plugins[pluginName][hookName](...args));
      }
    }
  }
  return results;
}

export default {
  register,
  use,
  all,
  useAll
}