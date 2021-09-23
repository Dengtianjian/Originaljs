import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  server: {
    proxy: {
      "/doubanapi": {
        target: "https://movie.douban.com",
        changeOrigin: true,
        rewrite(path) {
          return path.replace("/doubanapi", "");
        }
      },
      "/weiboapi": {
        target: "https://weibo.com",
        changeOrigin: true,
        rewrite(path) {
          return path.replace("/weiboapi", "");
        }
      }
    }
  },
  build: {
    minify: "esbuild",
    target: "esnext",
    lib: {
      entry: "src/index.ts",
      name: "original",
      formats: ["es", "iife"],
      fileName: "original",
    },
  }
});
