import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
const path = require("path");
import resolve from "@rollup/plugin-node-resolve";
// https://vitejs.dev/config/
export default defineConfig({
  // assetsInclude: ['**/assets/images/*'],
  build: {
    outDir: "./docs",
    // lib: {
    //   entry: path.resolve(__dirname, './assets/index.js'),
    //   name: 'MyLib',
    //   // the proper extensions will be added
    //   fileName: 'my-lib'
    // },
    assetsDir: './assets/',
    rollupOptions: {
      // external: /{{.*/,
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
        // inlineDynamicImports: true
      }
    },
    emptyOutDir: true,
  },
  plugins: [
    react(),
    // resolve({
    //   extensions: [".js", ".ts"]
    // })
  ],
  base: "./",
  server: {
    // host: "0.0.0.0",
    port: 9900
  }
});
