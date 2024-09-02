import vue from "@vitejs/plugin-vue2";
import vueJsx from "@vitejs/plugin-vue2-jsx";
import { viteCommonjs } from "@originjs/vite-plugin-commonjs"; // 让浏览器支持commonjs语法
import { visualizer } from "rollup-plugin-visualizer"; // 打包分析
import imagemin from "./imagemin";

import createSvgIcon from "./svg-icon";
import createCompression from "./compression";

export default function createVitePlugins(viteEnv, isBuild = false) {
  const vitePlugins = [
    vue(),
    vueJsx(),
    viteCommonjs(),
    visualizer({ open: true }),
    imagemin(),
  ];
  vitePlugins.push(createSvgIcon(isBuild));
  isBuild && vitePlugins.push(...createCompression(viteEnv));
  return vitePlugins;
}
