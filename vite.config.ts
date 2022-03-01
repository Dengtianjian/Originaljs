import { defineConfig } from "vite";
import watchHTML from "./watchHTML";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [watchHTML()],
  server: {
    proxy: {
      "/yuque": {
        target: "https://www.yuque.com/api",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/yuque/, "")
      },
      "/juejin": {
        target: "https://api.juejin.cn",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/juejin/, "")
      }
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
