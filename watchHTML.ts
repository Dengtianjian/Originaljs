import { PluginOption } from "vite";

export default function watchHTML(): PluginOption {

  return {
    name: "watchHTML",
    transform(code: string, id: string) {
      if (id.endsWith("html")) {
        return {
          code: `export default \`${code}\``
        }
      }
      return null;
    }
  }
}