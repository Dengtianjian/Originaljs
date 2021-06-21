import { IPluginItem, IPlugins } from "../../types/pluginType";

const Plugins: IPlugins = {};
function register(name: string, hooks: IPluginItem) {
  Plugins[name] = hooks;
}

function use(pluginName?: string): IPluginItem | IPlugins {
  if (pluginName) {
    return Plugins[pluginName];
  }
  return Plugins;
}

export default {
  register,
  use
}