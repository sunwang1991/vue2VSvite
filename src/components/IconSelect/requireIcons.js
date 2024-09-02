let modules = [];
const req = import.meta.glob("@/assets/icons/svg/*.svg", { eager: true }); // 这是修改后的代码
modules = Object.keys(req).map((i) => i.split("/").pop().split(".").shift());

export default modules;
