import auth from "@/plugins/auth";
import router, { homeRoute } from "@/router";
import Layout from "@/layout/index";
import ParentView from "@/components/ParentView";
import request from "@/api/public";
import { deepClone } from "@/utils";
// 匹配views里面所有的.vue文件
const modules = import.meta.glob("@/views/**/*.vue");

const permission = {
  state: {
    topbarRouters: [],
    sidebarRouters: [],
    defaultRoutes: [],
  },
  mutations: {
    SET_TOPBAR_ROUTES: (state, routes) => {
      state.topbarRouters = routes;
    },
    SET_SIDEBAR_ROUTERS: (state, routes) => {
      state.sidebarRouters = routes;
    },
    SET_DEFAULT_ROUTERS: (state, routes) => {
      state.defaultRoutes = routes;
    },
  },
  actions: {
    // 生成路由
    async GenerateRoutes({ commit }) {
      let menuIds = await getSystemMenus();
      if (menuIds.length > 0) {
        return new Promise((resolve, reject) => {
          request("/authorize/sys-menu/workMenuList", {
            sysId: menuIds,
          }).then((res) => {
            const sdata = JSON.parse(JSON.stringify(res.data));
            let assembleData = refitRouterList(sdata);
            // 按钮权限集合
            commit("SET_PERMISSIONS", assembleData.btn);
            let rewriteRoutes = assembleData.tree;
            //组装路由(包含重组二级路由、公共页面路由,详情等本地路由页面权限过滤后)
            let waitForAddRoute = [
              ...recombineRoute(assembleData.tree),
              ...homeRoute,
            ];
            waitForAddRoute.push({ path: "*", redirect: "/404", hidden: true });
            commit("SET_DEFAULT_ROUTERS", rewriteRoutes);
            commit("SET_TOPBAR_ROUTES", assembleData.tree);
            resolve(waitForAddRoute);
          });
        });
      } else {
        return Promise.reject(new Error(message));
      }
    },
  },
};

//获取顶部系统
function getSystemMenus() {
  return new Promise((resolve, reject) => {
    request("/authorize/sys-system/list")
      .then((res) => {
        let arr = [];
        let data = res.data;
        //pc固定的五个系统id,如有改动,对应调整
        // let menuIds = [371447078143236, 374535658992901, 374535711753477, 374535878972677,381638941857029];
        //pc固定的五个系统标识,如有改动,对应调整
        let menuCodes = [
          "xy_system",
          "xy_quality",
          "xy_data",
          "xy_merc_be",
          "xy_merc_mini",
        ];
        if (data && data.length) {
          data.forEach((i) => {
            if (menuCodes.find((j) => j == i.code)) {
              arr.push(i.id);
            }
          });
        }
        resolve(arr);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

//组装路由
function refitRouterList(allRouterMenu) {
  let newRouterList = new Array();
  let btnPromission = new Array(); //按钮权限

  for (let index = 0; index < allRouterMenu.length; index++) {
    const element = allRouterMenu[index];
    //系统路由转换
    let newSystemItem = adjustRouterList(element, true);
    if (element.menu && element.menu.length > 0) {
      //格式转换后的路由,同时收集按钮菜单权限
      let newMenuList = new Array();
      let menuList = element.menu;
      for (let index = 0; index < menuList.length; index++) {
        const router = menuList[index];
        let newRouterItem = adjustRouterList(router); //其他菜单路由转换
        newMenuList.push(newRouterItem); //添加到数据待用
        //按钮权限集合
        if (router.type !== 1) {
          btnPromission.push(router.code);
        }
      }
      newSystemItem.children = assembleRouter(newMenuList);
    }

    newRouterList.push(newSystemItem);
  }

  return {
    tree: newRouterList,
    btn: btnPromission,
  };
}

// 遍历系统模块下菜单，转化为路由组件对象
function adjustRouterList(routerItem, isSystemMenu = false) {
  let newRouterItem = {};
  if (isSystemMenu) {
    newRouterItem = {
      id: routerItem.id,
      name: routerItem.code.replace(/:/g, "_"),
      hidden: false,
      meta: {
        title: routerItem.name,
        icon: routerItem.icon,
      },
      path: "/" + routerItem.code, //路由路径
      component: Layout, //组件地址
      children: [],
    };
    return newRouterItem;
  }
  newRouterItem.name = routerItem.code.replace(/:/g, "_");
  newRouterItem.id = routerItem.id;
  newRouterItem.paterId = routerItem.paterId;
  newRouterItem.hidden = false;
  newRouterItem.meta = {
    icon: routerItem.icon,
    title: routerItem.name,
  };

  //根目录及其他目录处理
  if (
    (routerItem.paterId === null && routerItem.type != 2) ||
    routerItem.type == 1
  ) {
    newRouterItem.path = "/" + routerItem.route; //路由路径
    newRouterItem.component = ParentView;
  }

  //菜单项处理
  if (routerItem.type == 2) {
    newRouterItem.path = "/" + routerItem.route; //路由路径
    newRouterItem.component = loadView(
      //兼容未设置path地址的菜单
      routerItem.path ? routerItem.path : routerItem.route
    );
    newRouterItem.code = routerItem.code;
  }

  //按钮/功能处理
  if (routerItem.type == 3) {
    newRouterItem = routerItem;
  }

  return newRouterItem;
}

//遍历后台传来的路由,组成路由树结构
function assembleRouter(allRouterMenu) {
  // 收集每一项的下标
  const idMapping = allRouterMenu.reduce((acc, el, i) => {
    acc[el.id] = i;
    return acc;
  }, {});
  let root = [];
  allRouterMenu.forEach((el) => {
    // 判断根节点
    if (el.paterId === null || el.paterId === 0) {
      root.push(el);
      return;
    }
    // 用映射表找到父元素
    const parentEl = allRouterMenu[idMapping[el.paterId]];
    // 把当前元素添加到父元素的`children`数组中
    if (el.type !== 3 && parentEl) {
      //非按钮，组成路由树结构
      parentEl.children = [...(parentEl.children || []), el];
    }
  });
  return root;
}

//遍历树节点,组装成二级路由
function recombineRoute(tree) {
  let newTree = deepClone(tree);
  let newRouter = [];
  for (let index = 0; index < newTree.length; index++) {
    const element = newTree[index];
    if (element.children && element.children.length > 0) {
      element.children = filtNode(element.children);
    }
    newRouter.push(element);
  }
  return newRouter;
}

//树形结构抓取所有末尾节点，组装数组
function filtNode(tree) {
  let nodeList = [];
  findLastNode(tree);
  function findLastNode(childList) {
    for (let index = 0; index < childList.length; index++) {
      const element = childList[index];
      if (!element.children) {
        nodeList.push(element);
      } else {
        findLastNode(element.children);
      }
    }
  }
  return nodeList;
}

// 动态路由遍历，验证是否具备权限
export function filterDynamicRoutes(routes) {
  const res = [];
  routes.forEach((route) => {
    if (route.permissions) {
      if (auth.hasPermiOr(route.permissions)) {
        res.push(route);
      }
    } else if (route.roles) {
      if (auth.hasRoleOr(route.roles)) {
        res.push(route);
      }
    }
  });
  return res;
}

export const loadView = (view) => {
  let res;
  for (const path in modules) {
    let dir = "";
    if (path.indexOf("index.vue") && path != "/src/views/index.vue") {
      dir = path.split("views/")[1].split("/index.vue")[0];
    } else {
      dir = path.split("views/")[1].split(".vue")[0];
    }
    if (dir === view) {
      res = () => modules[path]();
    }
  }
  return res;
};

export default permission;
