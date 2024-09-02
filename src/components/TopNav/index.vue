<template>
  <el-menu
    :default-active="activeMenu"
    mode="horizontal"
    active-text-color="#c2c2c2"
    background-color="rgb(48, 65, 86)"
    @select="handleSelect">
    <template v-for="(item, index) in topMenus">
      <el-menu-item v-if="index < visibleNumber" :key="index" :index="item.path"
        ><svg-icon :icon-class="item.meta.icon" />
        {{ item.meta.title }}</el-menu-item
      >
    </template>

    <!-- 顶部菜单超出数量折叠 -->
    <el-submenu v-if="topMenus.length > visibleNumber" index="more">
      <template slot="title">更多菜单</template>
      <template v-for="(item, index) in topMenus">
        <el-menu-item
          v-if="index >= visibleNumber"
          :key="index"
          :index="item.path"
          ><svg-icon :icon-class="item.meta.icon" />
          {{ item.meta.title }}</el-menu-item
        >
      </template>
    </el-submenu>
  </el-menu>
</template>

<script>
import { constantRoutes } from "@/router";

// 隐藏侧边栏路由
const hideList = ["/index", "/user/profile"];

export default {
  data() {
    return {
      // 顶部栏初始数
      visibleNumber: 5,
      // 当前激活菜单的 index
      currentIndex: undefined,
    };
  },
  computed: {
    theme() {
      return this.$store.state.settings.theme;
    },
    // 顶部显示菜单
    topMenus() {
      const topMenus = [];
      this.routers.map((menu) => {
        if (menu.hidden !== true) {
          topMenus.push(menu);
        }
      });
      return topMenus;
    },
    // 所有的路由信息
    routers() {
      return this.$store.state.permission.topbarRouters;
    },
    // 设置子路由
    childrenMenus() {
      var childrenMenus = [];
      this.routers.map((router) => {
        for (var item in router.children) {
          if (router.children[item].parentPath === undefined) {
            // if (router.path === "/") {
            //   router.children[item].path = "/" + router.children[item].path;
            // } else {
            //   if (!this.ishttp(router.children[item].path)) {
            //     router.children[item].path = router.path + "/" + router.children[item].path;
            //   }
            // }
            router.children[item].parentPath = router.path;
          }
          childrenMenus.push(router.children[item]);
        }
      });
      return constantRoutes.concat(childrenMenus);
    },
    // 默认激活的菜单
    activeMenu() {
      const path = this.$route.path;
      let activePath = path;
      if (
        path !== undefined &&
        path.lastIndexOf("/") > 0 &&
        hideList.indexOf(path) === -1
      ) {
        const tmpPath = path.substring(1, path.length);
        activePath = "/" + tmpPath.substring(0, tmpPath.indexOf("/"));
        if (!this.$route.meta.link) {
          this.$store.dispatch("app/toggleSideBarHide", false);
        }
        //侧边栏显示
        this.activeRoutes(activePath);
      } else if (!this.$route.children && path !== "/index") {
        activePath = path;
        this.$store.dispatch("app/toggleSideBarHide", true);
      } else if (path === "/index" && this.topMenus.length > 0) {
        activePath = this.topMenus[0].path;
      }

      // 默认系统id
      if (path !== "/index" && this.topMenus.length > 0) {
        let activeItem = this.topMenus.find((item) => item.path === activePath);
        localStorage.setItem("sysId", activeItem.id);
      }

      return activePath;
    },
  },

  watch: {
    "$route.path": {
      handler(newVal, oldVal) {
        if (newVal === "/index" && this.topMenus.length > 0) {
          // 设置默认打开左侧菜单,同时定位到第一个系统
          let activePath = this.topMenus[0].path;
          this.handleSelect(activePath);
        }
      },
      deep: true,
      immediate: true,
    },
  },

  beforeMount() {
    window.addEventListener("resize", this.setVisibleNumber);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.setVisibleNumber);
  },
  mounted() {
    this.setVisibleNumber();
  },
  methods: {
    // 根据宽度计算设置显示栏数
    setVisibleNumber() {
      const width = document.body.getBoundingClientRect().width / 3;
      this.visibleNumber = parseInt(width / 85);
    },
    // 菜单选择事件
    handleSelect(key, keyPath) {
      // this.$tab.closeAllPage();
      this.currentIndex = key;
      const route = this.routers.find((item) => item.path === key);
      if (this.ishttp(key)) {
        // http(s):// 路径新窗口打开
        window.open(key, "_blank");
      } else if (!route || !route.children) {
        // 没有子路由路径内部打开
        this.$router.push({ path: key });
        this.$store.dispatch("app/toggleSideBarHide", true);
      } else {
        // 显示左侧联动菜单
        this.activeRoutes(key);
        this.$store.dispatch("app/toggleSideBarHide", false);
      }
    },
    // 当前激活的路由
    activeRoutes(key) {
      var routes = [];
      if (this.childrenMenus && this.childrenMenus.length > 0) {
        this.childrenMenus.map((item) => {
          if (key == item.parentPath || (key == "index" && item.path == "")) {
            routes.push(item);
          }
        });
      }

      if (routes.length > 0) {
        this.$store.commit("SET_SIDEBAR_ROUTERS", routes);
      } else {
        this.$store.dispatch("app/toggleSideBarHide", true);
      }
    },
    ishttp(url) {
      return url.indexOf("http://") !== -1 || url.indexOf("https://") !== -1;
    },

    getSysId(code) {
      return new Promise((resolve, reject) => {
        sysId({
          code: code,
        })
          .then((res) => {
            if (res.code == 200 && res.data.id) {
              resolve(res.data.id);
            } else {
              resolve("");
            }
          })
          .catch((err) => {
            resolve("");
          });
      });
    },
  },
};
</script>

<style lang="scss">
.topmenu-container.el-menu--horizontal > .el-menu-item {
  float: left;
  height: 50px !important;
  line-height: 50px !important;
  color: #fff !important;
  padding: 0 5px !important;
  margin: 0 10px !important;
}

.topmenu-container.el-menu--horizontal > .el-menu-item.is-active,
.el-menu--horizontal > .el-submenu.is-active .el-submenu__title {
  // border-bottom: 2px solid #{'var(--theme)'} !important;
  border-bottom: 0px solid #fff !important;
  color: #c2c2c2 !important;
}

/* submenu item */
.topmenu-container.el-menu--horizontal > .el-submenu .el-submenu__title {
  float: left;
  height: 50px !important;
  line-height: 50px !important;
  color: #999093 !important;
  padding: 0 5px !important;
  margin: 0 10px !important;
}

.el-menu--horizontal .el-menu-item:not(.is-disabled):hover {
  background-color: rgb(66, 83, 104) !important;
}

.el-menu--horizontal > .el-menu-item {
  border-bottom: 0 solid #fff !important;
}

.el-menu--horizontal > .el-submenu:hover .el-submenu__title {
  background-color: rgb(66, 83, 104) !important;
}

.topmenu-container.el-menu--horizontal > .el-submenu .el-submenu__title {
  color: #fff !important;
}
</style>
