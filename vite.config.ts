import { defineConfig, IndexHtmlTransformResult, Plugin } from "vite";
import FS from "fs";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    minify: true,
    lib: {
      entry: "src/runtime/index.ts",
      name: "original",
      formats: ["es", "iife"],
      fileName: "original",
    },
  },
});
