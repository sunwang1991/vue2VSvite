<template>
  <div class="login">
    <img class="login-bg" src="../assets/images/login-bg1.png" alt="" />
    <el-form
      ref="loginForm"
      :model="loginForm"
      :rules="loginRules"
      class="login-form">
      <div class="title">
        <div style="display: flex; width: 300px; margin: 0 auto">
          <h1 style="margin-top: 12px; font-weight: bold">喵星人</h1>
          <h2 style="font-weight: bold; margin-left: 10px">智能货柜管理平台</h2>
        </div>
      </div>
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
          style="width: 100%; background-color: #0071e3; margin: 35px 0 25px 0"
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

    <Verify
      ref="verify"
      :captcha-type="'blockPuzzle'"
      :img-size="{ width: '400px', height: '200px' }"
      @success="handleLogin" />

    <!--  底部  -->
    <div class="el-login-footer">
      <span
        >CopyRight ©2018-2020 XINGYUAN NET TECHNICAL 湘ICP备16021985号-3</span
      >
    </div>
  </div>
</template>

<script>
import { getCodeImg } from "@/api/login";
import Cookies from "js-cookie";
import { encrypt, decrypt } from "@/utils/jsencrypt";
import Verify from "@/components/verifition/Verify";

export default {
  name: "Login",
  components: {
    Verify,
  },
  data() {
    return {
      codeUrl: "",
      loginForm: {
        username: "",
        password: "",
        rememberMe: false,
        code: "",
        pointJson: "",
        clientType: "pc_web",
      },
      loginRules: {
        username: [
          { required: true, trigger: "blur", message: "请输入您的账号" },
        ],
        password: [
          { required: true, trigger: "blur", message: "请输入您的密码" },
        ],
        code: [{ required: true, trigger: "change", message: "请输入验证码" }],
      },
      loading: false,
      // 验证码开关
      captchaEnabled: false,
      // 注册开关
      register: false,
      redirect: undefined,
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
        rememberMe: rememberMe === undefined ? false : Boolean(rememberMe),
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
      this.$refs.verify.show();
    },
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          if (this.loginForm.rememberMe) {
            Cookies.set("username", this.loginForm.username, { expires: 30 });
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
            .dispatch("LoginMerc", this.loginForm)
            .then(() => {
              localStorage.setItem("isMercLogin", "1");
              this.loading = false;
              this.$router.push({ path: this.redirect || "/" }).catch(() => {});
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
  },
};
</script>

<style rel="stylesheet/scss" lang="scss">
.login {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  height: 100%;
  background-image: url("../assets/images/login-background.png");
  background-size: cover;
}

.login-bg {
  width: 49%;
  margin-right: 67px;
}

.title {
  margin: 25px auto 50px auto;
  text-align: center;
  font-style: italic;
  font-weight: bold;
  color: #000;
}

.login-form {
  border-radius: 20px;
  background: #ffffff;
  width: 29%;
  padding: 35px 35px 15px 35px;

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
}

.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #999;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}

.login-code-img {
  height: 38px;
}
</style>
