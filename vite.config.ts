import { defineConfig, IndexHtmlTransformResult, Plugin } from "vite";
import vue from "@vitejs/plugin-vue"; //* 暂时去掉vue
import vueJsx from "@vitejs/plugin-vue-jsx";
import FS from "fs";

const insertTemplate = (): Plugin => {
  return {
    name: "insert-template",
    apply: "build",
    // transformIndexHtml(html): IndexHtmlTransformResult {
    //   const fs = require("fs");
    //   const templateRoot = "./src/template";
    //   const template = fs.readdirSync(templateRoot);

    //   let templateContent = "";
    //   template.forEach((templateFile) => {
    //     const content = fs.readFileSync(templateRoot + "/" + templateFile);
    //     templateContent += content.toString() + "\n";
    //   });

    //   const body = String(html).match(/<body[^>]*>([\s\S]+?)<\/body>/i);
    //   let bodyContent: string = body[0];
    //   bodyContent = bodyContent.replace(
    //     /<body[^>]*>([\s\S]+?)<\/body>/i,
    //     `<body>${templateContent}\n${bodyContent}</body>`
    //   );

    //   return bodyContent;
    // },
    // load(id) {
    //   if (id.endsWith(".html")) {
    //     const template = require(id);
    //     console.log(template);
    //   }
    //   return "aaa";
    // },
    outputOptions(options) {
      options["chunkFileNames"] = "[name].js";
      options["entryFileNames"] = "[name].js";
      options["assetFileNames"] = "[name][extname]";
      return options;
    },
    transform(code, id) {
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
    polyfillDynamicImport: true,
    minify: true,
    // lib: {
    //   entry: "src/components/index.ts",
    //   name: "cui",
    //   formats: ["es"],
    // },
  },
});
