import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import * as path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "/@": `${__dirname}/src/`,
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "/@/styles/main.scss";`,
      },
    },
  },
  server: {
    port: 8080,
  },
  plugins: [vue()],
});
