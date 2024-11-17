import { defineConfig } from "vite";
import path from 'path';
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import { VantResolver } from "unplugin-vue-components/resolvers";
import svgLoader from 'vite-svg-loader'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    svgLoader(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver(), VantResolver()],
    }),
  ],
  server: {
    host: "0.0.0.0",
    proxy: {
      "/api": {
        // target: "http://172.16.11.238:8415",//任电脑
        // target: "http://172.16.11.213:8416", //侯电脑
        // target: "http://172.16.20.88:8415",//杰电脑
        // target: "http://10.10.102.198:8425", //测试环境
        target: "http://47.104.201.22:8487", //正式环境
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/"),
      },
      "/poc": {
        target: "http://47.104.201.22:8484",
        // target: "http://172.16.11.213:8415",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/poc/, "/"),
      },
      "/data": {
        target: "http://47.104.201.22:8481", //正式线
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/data/, "/"),
      },
      "/llm": {
        target: "http://172.16.20.88:8415",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/llm/, "/"),
      },
      "/llamacpp": {
        target: "http://172.16.20.88:8415",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/llamacpp/, "/"),
      },
      "/doc-master": {
        // target: "http://10.10.102.198:8425", // 测试服务器
        // target: "http://172.16.11.213:8425", // 后端本地
        target: "http://47.104.201.22:8488/", //正式环境
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/doc-master/, "/"),
        bypass(req, res, options) {
          const proxy_url = new URL(options.rewrite(req.url) || '', (options.target) as string)?.href || '';
          res.setHeader('x-req-proxy_url', proxy_url)
        }
      },
      "/aw": {
        // target: "http://172.16.11.213:8080", // 侯
        target: "http://47.104.201.22:8486",
        // target: "http://172.16.11.238:8415", // 后端本地
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/aw/, "/"),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
});
