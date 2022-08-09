import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import commonjsExternals from 'vite-plugin-commonjs-externals';
// import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import vitePluginRequire from "vite-plugin-require";

export default defineConfig({
  plugins: [react(),
    commonjsExternals({
    externals: ['fs'],
  }),
  vitePluginRequire({
    // @fileRegex RegExp
    // optional：default file processing rules are as follows
    // fileRegex:/(.jsx?|.tsx?|.vue)$/
  }),],
  build:{
    outDir:'docs'
  },
  base: './',
  server: {
    host: '0.0.0.0',
    port: 9900,
  },
})
