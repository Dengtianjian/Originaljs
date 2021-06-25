import { IPluginItem, IPlugins } from "../../types/pluginType";

const Plugins: IPlugins = {};
function register(name: string, hooks: IPluginItem) {
  Plugins[name] = hooks;
}

function use<T>(pluginName?: string): IPluginItem | IPlugins | T {
  if (pluginName) {
    return Plugins[pluginName];
  }
  return Plugins;
}

export default {
  register,
  use
}