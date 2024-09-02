import { defineConfig, loadEnv } from "vite";
import path from "path";
import createVitePlugins from "./vite/plugins";

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd());
  const { VITE_APP_ENV } = env;
  return {
    base: VITE_APP_ENV === "production" ? "/" : "/", // 设置项目根目录
    plugins: createVitePlugins(env, command === "build"), // vite插件
    resolve: {
      // 配置别名
      alias: {
        "~": path.resolve(__dirname, "./"),
        "@": path.resolve(__dirname, "./src"),
      },
      // 配置文件扩展名
      extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
    },

    server: {
      port: 90, // 设置端口号
      host: true, // 设置为true允许外部访问
      open: true, // 设置为true自动打开浏览器
    },

    build: {
      outDir: VITE_APP_ENV === "production" ? "dist" : "dist_test", // 打包输出目录
      sourcemap: false, // 生成sourceMap文件
      commonjsOptions: {
        transformMixedEsModules: true, // 解决node_modules中es6模块打包问题
      },
      rollupOptions: {
        output: {
          chunkFileNames: "js/[name]-[hash].js", // 引入文件名的名称
          entryFileNames: "js/[name]-[hash].js", // 包的入口文件名称
          assetFileNames: "[ext]/[name]-[hash].[ext]", // 资源文件像 字体，图片等
          manualChunks(id) {
            if (id.includes("node_modules")) {
              // 让每个插件都打包成独立的文件
              return id
                .toString()
                .split("node_modules/")[1]
                .split("/")[0]
                .toString();
            }

            // return "vendor"; // 将所有代码打包到一个文件中,减少http请求
          },
        },
      },

      terserOptions: {
        compress: {
          drop_console: true, // 生产环境自动去除console
          drop_debugger: true, // 生产环境自动去除debugger
        },
      },
    },
  };
});
