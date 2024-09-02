<template>
  <div class="login">
    <el-form
      ref="loginForm"
      :model="loginForm"
      :rules="loginRules"
      class="login-form">
      <el-form-item prop="username">
        <el-input
          v-model="loginForm.username"
          type="text"
          auto-complete="off"
          placeholder="账号">
          <svg-icon
            slot="prefix"
            icon-class="user"
            class="el-input__icon input-icon" />
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          auto-complete="off"
          placeholder="密码"
          @keyup.enter.native="handleLogin">
          <svg-icon
            slot="prefix"
            icon-class="password"
            class="el-input__icon input-icon" />
        </el-input>
      </el-form-item>
      <el-form-item v-if="captchaEnabled" prop="code">
        <el-input
          v-model="loginForm.code"
          auto-complete="off"
          placeholder="验证码"
          style="width: 63%"
          @keyup.enter.native="handleLogin">
          <svg-icon
            slot="prefix"
            icon-class="validCode"
            class="el-input__icon input-icon" />
        </el-input>
        <div class="login-code">
          <img :src="codeUrl" class="login-code-img" @click="getCode" />
        </div>
      </el-form-item>
      <el-checkbox
        v-model="loginForm.rememberMe"
        style="margin: 0px 0px 25px 0px; color: #999"
        >记住密码</el-checkbox
      >
      <el-form-item style="width: 100%">
        <el-button
          :loading="loading"
          size="medium"
          type="primary"
          class="login-btn"
          @click.native.prevent="checkPrama">
          <span v-if="!loading">登 录</span>
          <span v-else>登 录 中...</span>
        </el-button>
        <div v-if="register" style="float: right">
          <router-link class="link-type" :to="'/register'"
            >立即注册</router-link
          >
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { getCodeImg } from "@/api/login";
import Cookies from "js-cookie";
import { encrypt, decrypt } from "@/utils/jsencrypt";

export default {
  name: "Login",
  data() {
    return {
      codeUrl: "",
      loginForm: {
        username: "",
        password: "",
        rememberMe: true,
        code: "",
        pointJson: "",
        clientType: "pc_web",
      },
      loginRules: {
        username: [
          {
            required: true,
            trigger: "blur",
            message: "请输入您的账号",
          },
        ],
        password: [
          {
            required: true,
            trigger: "blur",
            message: "请输入您的密码",
          },
        ],
        code: [
          {
            required: true,
            trigger: "change",
            message: "请输入验证码",
          },
        ],
      },
      loading: false,
      // 验证码开关
      captchaEnabled: false,
      // 注册开关
      register: false,
      redirect: undefined,
      show: false,
      dialogTitle: "商户入驻平台协议",
    };
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true,
    },
  },
  beforeDestroy() {
    document.removeEventListener("keyup", this.handerKeyup);
  },
  created() {
    // this.getCode();
    this.getCookie();
    document.addEventListener("keyup", this.handerKeyup);
  },

  mounted() {
    let hrefArr = window.location.href.split("?");
    if (hrefArr[1]) {
      hrefArr[1].split("&").forEach((item) => {
        let arr = item.split("=");
        if (arr[0] == "status" && arr[1] == "1") {
          this.handleLogin();
        }
      });
    }
  },

  methods: {
    handerKeyup(e) {
      var keycode = document.all ? event.keyCode : e.which;
      if (keycode == 13) {
        this.checkPrama();
      }
    },
    getCode() {
      getCodeImg().then((res) => {
        this.captchaEnabled =
          res.captchaEnabled === undefined ? true : res.captchaEnabled;
        if (this.captchaEnabled) {
          this.codeUrl = "data:image/gif;base64," + res.img;
          this.loginForm.uuid = res.uuid;
        }
      });
    },
    getCookie() {
      const username = Cookies.get("username");
      const password = Cookies.get("password");
      const rememberMe = Cookies.get("rememberMe");
      this.loginForm = {
        username: username === undefined ? this.loginForm.username : username,
        password:
          password === undefined ? this.loginForm.password : decrypt(password),
        rememberMe: rememberMe === undefined ? true : Boolean(rememberMe),
        clientType: "pc_web",
        code: "",
      };
    },
    checkPrama() {
      if (!this.loginForm.username || !this.loginForm.password) {
        this.$message({
          message: "请输入完整的用户名密码",
          type: "error",
        });
        return false;
      }
      this.handleLogin();
    },
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          if (this.loginForm.rememberMe) {
            Cookies.set("username", this.loginForm.username, {
              expires: 30,
            });
            Cookies.set("password", encrypt(this.loginForm.password), {
              expires: 30,
            });
            Cookies.set("rememberMe", this.loginForm.rememberMe, {
              expires: 30,
            });
          } else {
            Cookies.remove("username");
            Cookies.remove("password");
            Cookies.remove("rememberMe");
          }
          this.loginForm.pointJson = localStorage.getItem("pointJson");

          this.$store
            .dispatch("Login", this.loginForm)
            .then(() => {
              localStorage.setItem("isMercLogin", "0");
              this.loading = false;
              this.$router
                .push({
                  path: this.redirect || "/",
                })
                .catch(() => {});
            })
            .catch(() => {
              this.loading = false;
              if (this.captchaEnabled) {
                // this.getCode();
              }
            });
        }
      });
    },

    dialogClick(title) {
      this.dialogTitle = title;
      this.show = true;
    },
  },
};
</script>

<style rel="stylesheet/scss" lang="scss">
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-image: url("../assets/images/login-background.jpg");
  background-size: 100% 100%;
  user-select: none;
}

.login-bg {
  width: 40%;
  margin: 0 10% 50px 4%;
}

.login-form {
  border-radius: 20px;
  background: #ffffff;
  width: 29%;
  padding: 35px 35px 15px 35px;
  margin-bottom: 100px;

  .el-input {
    height: 48px;

    input {
      height: 48px;
      border-radius: 12px;
    }
  }

  .input-icon {
    height: 49px;
    width: 14px;
    margin-left: 2px;
  }

  .el-button {
    height: 48px;
    border-radius: 12px;
  }
}

.title {
  margin: 6% auto 8% auto;
  text-align: center;
  font-style: italic;
  font-weight: bold;
  color: #000;
  div {
    display: flex;
    width: 300px;
    margin: 0 auto;
    h1 {
      margin-top: 12px;
      font-weight: bold;
    }
    h2 {
      font-weight: bold;
      margin-left: 10px;
    }
  }
}

.login-btn {
  width: 100%;
  background-color: #0071e3;
  margin: 6% 0 4%;
}

.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}

.login-code {
  width: 33%;
  height: 48px;
  float: right;

  img {
    cursor: pointer;
    vertical-align: middle;
  }

  .login-code-img {
    height: 38px;
  }
}

.dialog-content {
  white-space: pre-wrap;
}

.login-footer {
  position: fixed;
  bottom: 0px;
  width: 100%;
  background-color: rgb(51, 51, 51);
  color: #d9d9d9;
  padding-top: 20px;

  .more {
    .more-left {
      div {
        font-size: 12px;
        line-height: 26px;
      }

      div:nth-child(1) {
        font-size: 14px;
        padding-bottom: 14px;
      }

      div:nth-child(2) {
        cursor: pointer;
      }

      div:nth-child(3) {
        cursor: pointer;
      }
    }

    .more-center {
      div {
        font-size: 12px;
        line-height: 26px;

        span {
          margin-left: 16px;
        }
      }

      div:nth-child(1) {
        font-size: 14px;
        padding-bottom: 14px;
      }
    }

    .more-right {
      position: relative;

      div {
        font-size: 12px;
        line-height: 26px;

        span {
          margin-left: 16px;
        }
      }

      div:nth-child(1) {
        font-size: 14px;
        padding-bottom: 14px;
      }

      img {
        width: 80px;
        height: 80px;
        position: absolute;
        bottom: -24px;
        left: 30px;
      }
    }
  }

  .copyright {
    color: #999;
    font-size: 12px;
    letter-spacing: 1px;
    text-align: center;
    line-height: 40px;
  }
}
</style>
