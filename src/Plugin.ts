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

export function useAll(hookName: keyof TPluginItem, args: any[] = []): void {
  const plugins: TPlugins = all();
  for (const pluginName in plugins) {
    if (Object.prototype.hasOwnProperty.call(plugins, pluginName)) {
      if (plugins[pluginName].setUpdateView) {
        plugins[pluginName][hookName](...args);
      }
    }
  }
}

export default {
  register,
  use,
  all,
  useAll
}