import Cookies from "js-cookie";

function getTokenKey() {
  return sessionStorage.getItem("username") + "-Token";
}

export function getToken() {
  return Cookies.get(getTokenKey());
}

export function setToken(token) {
  return Cookies.set(getTokenKey(), token);
}

export function removeToken() {
  return Cookies.remove(getTokenKey());
}

function getMercIdKey() {
  return sessionStorage.getItem("username") + "-MercId";
}

export function getMercId() {
  return Cookies.get(getMercIdKey());
}

export function setMercId(mercId) {
  return Cookies.set(getMercIdKey(), mercId);
}

export function removeMercId() {
  return Cookies.remove(getMercIdKey());
}
