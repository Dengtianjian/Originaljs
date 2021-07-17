import { TPluginItem } from "./types/Plugin";

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

export default {
  register,
  use
}