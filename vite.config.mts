// Plugins
import Components from 'unplugin-vue-components/vite';
import Vue from '@vitejs/plugin-vue';
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
import ViteFonts from 'unplugin-fonts/vite';
import mkcert from "vite-plugin-mkcert";

// 时间戳
const timestamp = new Date().getTime();

// Utilities
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: ['axios'],
    // exclude: []
  },
  plugins: [
    Vue({
      template: { transformAssetUrls },
    }),
    VitePWA(),
    // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
    Vuetify(),
    Components(),
    ViteFonts({
      google: {
        families: [{
          name: 'Roboto',
          styles: 'wght@100;300;400;500;700;900',
        }],
      },
    }),
    mkcert(),
  ],
  define: {
    'process.env': {},
    "process.platform": {},
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
    // https: true
  },
  build: {
    outDir: 'dist', // 生成输出的根目录。如果该目录存在，则会在生成之前将其删除。 默认文件夹名称为dist
    assetsDir: 'public/assets',
    target: 'esnext',
    terserOptions: {
      compress: {
        drop_console: true, // 生产环境去掉控制台 console
        drop_debugger: true, // 生产环境去掉控制台 debugger 默认就是true
        dead_code: true, // 删除无法访问的代码 默认就是true
      },
      output: {
        //去掉注释内容
        comments: true,
      },
    },
    chunkSizeWarningLimit: 2000, // 调整区块大小警告限制
  }
})
