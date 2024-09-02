import Vue from "vue";
import SvgIcon from "@/components/SvgIcon"; // svg component

// register globally
Vue.component("svg-icon", SvgIcon);
// let modules = [];
// const req = import.meta.glob("./svg/*.svg", { eager: true }); // 这是修改后的代码
// modules = Object.keys(req).map((i) => req[i]);
// console.log(modules);
