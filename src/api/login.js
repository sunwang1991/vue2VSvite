import request from "@/utils/request";

// 登录方法
export function login(loginName, password, code, clientType, pointJson) {
  const data = {
    loginName,
    password,
    code,
    clientType,
    pointJson,
  };
  return request({
    url: "/authorize/sysWorkUser/login",
    headers: {
      isToken: false,
    },
    method: "post",
    data: data,
  });
}

// 登录方法
export function loginMerc(loginName, password, code, clientType, pointJson) {
  const data = {
    loginName,
    password,
    code,
    clientType,
    pointJson,
  };
  return request({
    url: "/merc/mini/login",
    headers: {
      isToken: false,
    },
    method: "post",
    data: data,
  });
}

// 注册方法
export function register(data) {
  return request({
    url: "/register",
    headers: {
      isToken: false,
    },
    method: "post",
    data: data,
  });
}

// 获取用户详细信息
export function getInfo() {
  return request({
    url: "/getInfo",
    method: "get",
  });
}

// 退出方法
export function logout() {
  return request({
    url: "/authorize/sysWorkUser/logout",
    method: "post",
  });
}

// 获取验证码
export function getCodeImg() {
  return request({
    url: "/captchaImage",
    headers: {
      isToken: false,
    },
    method: "get",
    timeout: 20000,
  });
}
