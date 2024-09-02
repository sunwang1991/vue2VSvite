import { login, logout, getInfo, loginMerc } from "@/api/login";
import { getToken, setToken, removeToken, setMercId } from "@/utils/auth";

const user = {
  state: {
    token: getToken(),
    name: "",
    avatar: "",
    roles: [],
    permissions: [],
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token;
    },
    SET_NAME: (state, name) => {
      state.name = name;
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar;
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles;
    },
    SET_PERMISSIONS: (state, permissions) => {
      state.permissions = permissions;
    },
  },

  actions: {
    // 登录
    Login({ commit }, userInfo) {
      const username = userInfo.username.trim();
      const password = userInfo.password;
      const code = userInfo.code;
      const clientType = userInfo.clientType;
      const pointJson = userInfo.pointJson;
      return new Promise((resolve, reject) => {
        login(username, password, code, clientType, pointJson)
          .then((res) => {
            sessionStorage.setItem("username", username);
            setToken(res.data);
            commit("SET_TOKEN", res.data);
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      });
    },

    // 登录
    LoginMerc({ commit }, userInfo) {
      const username = userInfo.username.trim();
      const password = userInfo.password;
      const code = userInfo.code;
      const clientType = userInfo.clientType;
      const pointJson = userInfo.pointJson;
      return new Promise((resolve, reject) => {
        loginMerc(username, password, code, clientType, pointJson)
          .then((res) => {
            sessionStorage.setItem("username", res.data.mercName);
            setToken(res.data.satoken);
            setMercId(res.data.mercId);
            commit("SET_TOKEN", res.data.satoken);
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      });
    },

    // 获取用户信息
    GetInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        //   getInfo().then(res => {
        //     const user = res.user
        //     const avatar = (user.avatar == "" || user.avatar == null) ? require("@/assets/images/profile.jpg") : import.meta.env.VITE_APP_BASE_API + user.avatar;
        //     if (res.roles && res.roles.length > 0) { // 验证返回的roles是否是一个非空数组
        //       commit('SET_ROLES', res.roles)
        //       commit('SET_PERMISSIONS', res.permissions)
        //     } else {
        //       commit('SET_ROLES', ['ROLE_DEFAULT'])
        //     }
        //     commit('SET_NAME', user.userName)
        //     commit('SET_AVATAR', avatar)
        //     resolve(res)
        //   }).catch(error => {
        //     reject(error)
        //   })
        commit("SET_ROLES", "test");
        commit("SET_NAME", "test");
        commit(
          "SET_AVATAR",
          new URL(`../../assets/images/profile.jpg`, import.meta.url).href
        );
        resolve("test");
      });
    },

    // 退出系统
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout(state.token)
          .then(() => {
            commit("SET_TOKEN", "");
            commit("SET_ROLES", []);
            commit("SET_PERMISSIONS", []);
            removeToken();
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      });
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise((resolve) => {
        commit("SET_TOKEN", "");
        removeToken();
        resolve();
      });
    },
  },
};

export default user;
