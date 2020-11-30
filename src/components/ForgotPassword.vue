<template>
  <div class="signup">
    <v-content class="pa-0">
      <v-flex justify-space-around v-if="errorMsg != ''" color="primary">
        <v-card color="red">
          <v-alert type="error">
            {{ errorMsg }}
          </v-alert>
        </v-card>
      </v-flex>
      <v-layout justify-space-around v-if="userInfo === null && !verifying && !finalizing && !processing & !finalized" color="primary">
        <v-card>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-card-text>
              <p>
                لطفا پست الکترونیکی که با آن ثبت نام کرده‌اید را وارد کنید:
              </p>
            </v-card-text>
            <v-card-text>
              <v-text-field class="ltrinput" prepend-inner-icon="email" :rules="emailRules" v-model="email" label="پست الکترونیکی" required></v-text-field>
            </v-card-text>
            <v-card-text>
              <v-img v-if="captchaImageId != ''" :src="`${appConfig.$api_url}/api/rimages/${captchaImageId}.jpg`" max-width="50px" max-height="30px" class="lighten-2"> </v-img>
            </v-card-text>
            <v-card-text>
              <p>
                عددی را که در تصویر امنیتی بالا می‌بینید در کادر زیر وارد کنید:
              </p>
              <v-text-field class="ltrinput" prepend-inner-icon="lock" :rules="captchaRules" v-model="captcha" label="عدد تصویر امنیتی" required></v-text-field>
            </v-card-text>
            <v-card-text>
              <v-btn color="success" v-on:click="forgot()">ادامه</v-btn>
            </v-card-text>
          </v-form>
        </v-card>
      </v-layout>
      <v-layout justify-space-around v-if="verifying && !processing" color="primary">
        <v-card>
          <v-card-text v-if="secret == ''">
            <p>
              لطفا پست الکترونیکی خود را چک کنید. در صورتی که نشانی پست الکترونیکی خود را درست وارد کرده باشید نامه‌ای از گنجینهٔ گنجور دریافت کرده‌اید که حاوی یک رمز است.
            </p>
            <p>
              یا روی نشانی ارسال شده به پست الکترونیکی خود کلیک کنید یا رمز دریافتی را در کادر زیر وارد کنید:
            </p>
          </v-card-text>
          <v-card-text>
            <v-text-field class="ltrinput" prepend-inner-icon="lock" v-model="secret" placeholder="رمز دریافتی"></v-text-field>
          </v-card-text>
          <v-card-text>
            <v-btn color="success" v-on:click="verify()">ادامه</v-btn>
          </v-card-text>
        </v-card>
      </v-layout>
      <v-layout justify-space-around v-if="finalizing && !processing" color="primary">
        <v-card>
          <v-card-text>
            <p>
              لطفا گذرواژهٔ جدید خود برای ورود را وارد کنید.
            </p>
            <p>
              گذرواژه باید شامل ۶ حرف باشد و از ترکیبی از اعداد و حروف انگلیسی تشکیل شده باشد.
            </p>
            <p>
              حروف و اعداد نباید تکراری باشند و وجود حداقل یک عدد و یک حرف کوچک انگلیسی در گذرواژه الزامی است.
            </p>
          </v-card-text>
          <v-card-text>
            <v-text-field prepend-inner-icon="lock" v-model="password" type="password" placeholder="گذرواژه دلخواه"></v-text-field>
          </v-card-text>
          <v-card-text>
            <v-text-field prepend-inner-icon="lock" v-model="confirm" type="password" placeholder="تکرار گذرواژه"></v-text-field>
          </v-card-text>
          <v-card-text>
            <v-btn color="error" v-on:click="finalize()">ادامه</v-btn>
          </v-card-text>
        </v-card>
      </v-layout>
      <v-layout justify-space-around v-if="processing" color="primary">
        <v-progress-linear indeterminate></v-progress-linear>
      </v-layout>
      <v-layout justify-space-around v-if="finalized" color="primary">
        <v-card>
          <router-link to="/">
            <v-btn color="green" class="ma-2 white--text" @click="signin"> تبریک! گذرواژهٔ شما تغییر کرد. برای ورود به سیستم کلیک کنید. ‌<v-icon right dark>done</v-icon> </v-btn>
          </router-link>
        </v-card>
      </v-layout>
      <v-layout justify-space-around v-else-if="userInfo != null">
        <div>
          <v-card>
            <v-card-text>
              شما پیش‌تر وارد سیستم شده‌اید!
            </v-card-text>
          </v-card>
        </div>
      </v-layout>
    </v-content>
  </div>
</template>

<script>
import axios from "axios";
import axiosErrorHandler from "./../utilities/axiosErrorHandler";
import { EventBus } from "../event-bus";

export default {
  name: "ForgotPassword",
  data() {
    return {
      valid: true,
      captchaImageId: "",
      email: "",
      emailRules: [v => !!v || "لطفا ایمیل خود را وارد نمایید", v => /.+@.+\..+/.test(v) || "ایمیل وارد شده معتبر نیست"],
      captcha: "",
      captchaRules: [v => !!v || "مقدار تصویر فوق را وارد نمایید", v => (v && v.length == 5) || "عددی امنیتی پنج رقم می باشد"],
      secret: "",
      password: "",
      passwordRules: [v => !!v || "کلمه عبور خود را وارد نمایید ", v => (v && v.length == 5) || "عددی امنیتی پنج رقم می باشد"],
      confirm: "",
      userInfo: null,
      errorMsg: "",
      verifying: false,
      processing: false,
      finalizing: false,
      finalized: false,
    };
  },
  mounted() {
    document.title = "گنجینهٔ گنجور - فراموشی گذرواژه";

    if (localStorage.getItem("userInfo")) {
      try {
        this.userInfo = JSON.parse(localStorage.getItem("userInfo"));
      } catch (e) {
        localStorage.removeItem("userInfo");
      }
    } else {
      if (this.$route.query.secret != null) {
        this.verifying = true;
        this.secret = this.$route.query.secret;
      }

      if (!this.verifying) {
        if (this.$route.query.email != null) {
          this.email = this.$route.query.email;
        }
        this.newcaptcha();
      }
    }
  },
  methods: {
    validate() {
      this.$refs.form.validate();
    },
    newcaptcha() {
      this.errorMsg = "";
      this.processing = true;
      axios({
        method: "GET",
        url: this.appConfig.$api_url + "/api/users/captchaimage",
        data: {},
        headers: { "content-type": "application/json" },
      }).then(
        result => {
          this.captchaImageId = result.data;
          this.processing = false;
        },
        error => {
          this.processing = false;
          this.errorMsg = axiosErrorHandler.handle(error);
        }
      );
    },
    forgot() {
      var clientValidation = this.$refs.form.validate();
      if (!clientValidation) {
        return;
      }
      this.errorMsg = "";
      this.processing = true;
      axios({
        method: "POST",
        url: this.appConfig.$api_url + "/api/users/forgotpassword",
        data: {
          email: this.email,
          clientAppName: "Museum Clinet Web UI",
          language: "fa-IR",
          captchaImageId: this.captchaImageId,
          captchaValue: this.captcha,
          callbackUrl: 'https://museum.ganjoor.net/forgot-password'
        },
        headers: {
          "content-type": "application/json",
        },
      }).then(
        () => {
          this.processing = false;
          this.verifying = true;
        },
        error => {
          this.newcaptcha();
          this.processing = false;
          this.errorMsg = axiosErrorHandler.handle(error);
        }
      );
    },
    verify() {
      this.errorMsg = "";
      this.processing = true;
      axios({
        method: "GET",
        url: this.appConfig.$api_url + "/api/users/verify?type=1&secret=" + this.secret,
        data: {},
        headers: {
          "content-type": "application/json",
        },
      }).then(
        result => {
          this.processing = false;
          this.verifying = false;
          this.finalizing = true;
          this.email = result.data;
        },
        error => {
          this.processing = false;
          this.errorMsg = axiosErrorHandler.handle(error);
        }
      );
    },
    finalize() {
      this.errorMsg = "";
      if (this.password != this.confirm) {
        this.errorMsg = "تکرار گذرواژه با گذرواژه وارد شده همخوانی ندارد.";
        return;
      }

      this.processing = true;
      axios({
        method: "POST",
        url: this.appConfig.$api_url + "/api/users/resetpassword",
        data: {
          email: this.email,
          secret: this.secret,
          password: this.password,
        },
        headers: {
          "content-type": "application/json",
        },
      }).then(
        () => {
          this.processing = false;
          this.finalizing = false;
          this.finalized = true;
        },
        error => {
          this.processing = false;
          this.errorMsg = axiosErrorHandler.handle(error);
        }
      );
    },
    signin() {
      this.errorMsg = "";
      this.processing = true;
      axios({
        method: "POST",
        url: this.appConfig.$api_url + "/api/users/login",
        data: {
          username: this.email,
          password: this.password,
          clientAppName: "Vue.js Client App",
          language: "fa-IR",
        },
        headers: { "content-type": "application/json" },
      }).then(
        result => {
          localStorage.setItem("userInfo", JSON.stringify(result.data));
          this.userInfo = result.data;
          EventBus.$emit("user-logged-in", this.userInfo);
          this.processing = false;
          this.$router.push("/");
        },
        error => {
          this.processing = false;
          this.errorMsg = axiosErrorHandler.handle(error);
        }
      );
    },
  },
};
</script>

<style>
.ltrinput input {
  direction: ltr;
}
</style>
