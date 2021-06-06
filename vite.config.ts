import { defineConfig, IndexHtmlTransformResult, Plugin } from "vite";
import vue from "@vitejs/plugin-vue"; //* 暂时去掉vue
import vueJsx from "@vitejs/plugin-vue-jsx";
import FS from "fs";

const insertTemplate = (): Plugin => {
  return {
    name: "insert-template",
    apply: "build",
    outputOptions(options) {
      options["chunkFileNames"] = "[name].js";
      options["entryFileNames"] = "[name].js";
      options["assetFileNames"] = "[name][extname]";
      return options;
    },
    transform(code, id) {
      console.log(id);

      if (/(await)? ?importTemplate\(".+"\)/.test(code)) {
        let templateFile = code.match(/(?<=importTemplate\(")(.+)(?="\))/gi);

        for (const templateFilePath of templateFile) {
          let filePath: string = templateFilePath;
          if (filePath.startsWith("./") || filePath.startsWith("../")) {
            filePath = filePath.replace(/\.\/|\.\.\//g, "");
          }
          filePath = process.cwd() + "/src/" + filePath;

          if (FS.existsSync(filePath)) {
            const templateFile = FS.readFileSync(filePath);
            code = code.replace(
              /(await)? ?importTemplate\(".+"\)/,
              `\`${templateFile.toString()}\``
            );
          }
        }
      }
      return code;
    },
  };
};

function addExportToHTMLFile(): Plugin {
  return {
    name: "add-export-to-html-file",
    apply: "serve",
    transform(code, id) {
      if (id.endsWith(".html")) {
        return `export default \`${code}\``;
      }
      return code;
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [insertTemplate(), addExportToHTMLFile()],
  build: {
    minify: true,
    lib: {
      entry: "src/runtime/index.ts",
      name: "original",
      formats: ["es"],
      fileName: "original",
    },
  },
});
