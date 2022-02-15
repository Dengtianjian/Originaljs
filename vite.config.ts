import { defineConfig } from "vite";
import watchHTML from "./watchHTML";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [watchHTML()],
  server: {
    proxy: {
    }
  },
  build: {
    minify: "esbuild",
    target: "esnext",
    // lib: {
    //   entry: "src/index.ts",
    //   name: "original",
    //   formats: ["es", "iife"],
    //   fileName: "original",
    // },
  }
});
