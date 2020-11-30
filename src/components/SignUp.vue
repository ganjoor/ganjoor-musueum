<template>
  <div class="signup">
    <v-content class="pa-0">
      <v-flex justify-space-around v-if="errorMsg != ''" xs12>
        <v-card>
          <v-alert type="error">
            {{ errorMsg }}
          </v-alert>
        </v-card>
      </v-flex>
      <v-layout justify-space-around v-if="userInfo === null && !verifying && !finalizing && !processing && !finalized" color="primary">
        <v-card>
          <v-form ref="form" v-model="step1Valid" lazy-validation>
            <v-card-text>
              <p>لطفا پست الکترونیکی خود را جهت ثبت نام وارد کنید:</p>
            </v-card-text>
            <v-card-text>
              <v-text-field class="ltrinput" prepend-inner-icon="email" v-model="email" :rules="emailRules" label="پست الکترونیکی" required></v-text-field>
            </v-card-text>
            <v-card-text>
              <v-img v-if="captchaImageId != ''" :src="`${appConfig.$api_url}/api/rimages/${captchaImageId}.jpg`" max-width="50px" max-height="30px" class="lighten-2"> </v-img>
            </v-card-text>
            <v-card-text>
              <p>
                عددی را که در تصویر امنیتی بالا می‌بینید در کادر زیر وارد کنید:
              </p>
              <v-text-field class="ltrinput" prepend-inner-icon="lock" v-model="captcha" :rules="captchaRules" label="عدد تصویر امنیتی" required></v-text-field>
            </v-card-text>
            <v-card-text>
              <v-btn color="success" :disabled="!step1Valid" class="mr-4" v-on:click="signup()">ادامه</v-btn>
            </v-card-text>
          </v-form>
        </v-card>
      </v-layout>
      <v-layout justify-space-around v-if="verifying && !processing" color="primary">
        <v-form ref="form2" v-model="step2Valid" lazy-validation>
          <v-card>
            <v-card-text>
              <p>
                لطفا پست الکترونیکی خود را چک کنید. در صورتی که نشانی پست الکترونیکی خود را درست وارد کرده باشید نامه‌ای از گنجینهٔ گنجور دریافت کرده‌اید که حاوی یک رمز است.
              </p>

              <p>
                یا روی نشانی ارسال شده به پست الکترونیکی خود کلیک کنید یا رمز دریافتی را در کادر زیر وارد کرده روی دکمهٔ «ادامه» کلیک کنید.
              </p>
            </v-card-text>
            <v-card-text>
              <v-text-field class="ltrinput" prepend-inner-icon="lock" v-model="secret" :rules="secretRules" label="رمز دریافتی" required></v-text-field>
            </v-card-text>
            <v-card-text>
              <v-btn color="success" :disabled="!step2Valid" v-on:click="verify()">ادامه</v-btn>
            </v-card-text>
            <v-card-text>
              <img src="../assets/images/signup-email1.png" />
              <img src="../assets/images/signup-email2.png" />
            </v-card-text>
          </v-card>
        </v-form>
      </v-layout>
      <v-layout justify-space-around v-if="finalizing && !processing" color="primary">
        <v-form ref="form3" v-model="step3Valid" lazy-validation>
          <v-card>
            <v-card-text>
              <p>
                لطفا نام و نام خانوادگی و رمز مد نظر خود برای ورود را وارد کنید.
              </p>
            </v-card-text>
            <v-card-text>
              <v-text-field prepend-inner-icon="person" v-model="firstName" :rules="firstNameRules" required label="نام"></v-text-field>
            </v-card-text>
            <v-card-text>
              <v-text-field prepend-inner-icon="person" v-model="sureName" label="نام خانوادگی"></v-text-field>
            </v-card-text>
            <v-card-text>
              <p>
                گذرواژه باید شامل ۶ حرف باشد و از ترکیبی از اعداد و حروف انگلیسی تشکیل شده باشد.
              </p>
              <p>
                حروف و اعداد نباید تکراری باشند و وجود حداقل یک عدد و یک حرف کوچک انگلیسی در گذرواژه الزامی است.
              </p>
            </v-card-text>
            <v-card-text>
              <v-text-field prepend-inner-icon="lock" v-model="password" :rules="passwordRules" type="password" label="گذرواژه دلخواه" required></v-text-field>
            </v-card-text>
            <v-card-text>
              <v-text-field prepend-inner-icon="lock" v-model="confirm" :rules="passwordRules" type="password" label="تکرار گذرواژه" required></v-text-field>
            </v-card-text>
            <v-card-text>
              <v-btn color="success" :disabled="!step3Valid" v-on:click="finalize()">ادامه</v-btn>
            </v-card-text>
          </v-card>
        </v-form>
      </v-layout>
      <v-layout justify-space-around v-if="processing" color="primary">
        <v-progress-linear indeterminate></v-progress-linear>
      </v-layout>
      <v-layout justify-space-around v-if="finalized" color="primary">
        <v-card>
          <router-link to="/">
            <v-btn color="green" class="ma-2 white--text" @click="signin"> تبریک! ثبت نام تکمیل شد. برای ورود به سیستم کلیک کنید. ‌<v-icon right dark>done</v-icon> </v-btn>
          </router-link>
        </v-card>
      </v-layout>
      <v-layout justify-space-around v-else-if="userInfo != null">
        <div>
          <v-card>
            <v-card-text> شما پیشتر ثبت نام کرده‌اید! </v-card-text>
          </v-card>
        </div>
      </v-layout>
    </v-content>
  </div>
</template>

<script>
import axios from "axios";
import { EventBus } from "../event-bus";
import axiosErrorHandler from "./../utilities/axiosErrorHandler";

export default {
  name: "SignUp",
  data() {
    return {
      step1Valid: true,
      captchaImageId: "",
      email: "",
      emailRules: [v => !!v || "لطفا ایمیل خود را وارد نمایید", v => /.+@.+\..+/.test(v) || "ایمیل وارد شده معتبر نیست"],
      captcha: "",
      captchaRules: [v => !!v || "مقدار تصویر فوق را وارد نمایید", v => (v && v.length == 5) || "عددی امنیتی پنج رقم می باشد"],
      step2Valid: true,
      secret: "",
      secretRules: [v => !!v || "رمز دریافتی را وارد نمایید", v => (v && v.length > 4) || "رمز دریافتی حداقل پنج کاراکتر می باشد"],
      step3Valid: true,
      firstName: "",
      firstNameRules: [v => !!v || "لطفا یک نام برای خود انتخاب نمایید"],
      sureName: "",
      password: "",
      passwordRules: [v => !!v || "کلمه عبور خود را وارد نمایید", v => (v && v.length > 5) || "کلمه عبور حداقل شش کاراکتر می باشد"],
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
    document.title = "گنجینهٔ گنجور - ثبت نام کاربر جدید";

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
    newcaptcha() {
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
          if (error.response && error.response.data) {
            this.errorMsg = error.response.data;
          } else {
            this.errorMsg = axiosErrorHandler.handle(error);
          }
        }
      );
    },
    signup() {
      if (!this.$refs.form.validate()) {
        return;
      }

      this.processing = true;
      this.errorMsg = "";
      axios({
        method: "POST",
        url: this.appConfig.$api_url + "/api/users/signup",
        data: {
          email: this.email,
          clientAppName: "Museum Clinet Web UI",
          language: "fa-IR",
          captchaImageId: this.captchaImageId,
          captchaValue: this.captcha,
          callbackUrl: 'https://museum.ganjoor.net/signup'
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
          if (error.response && error.response.data) {
            this.errorMsg = error.response.data;
          } else {
            this.errorMsg = axiosErrorHandler.handle(error);
          }
        }
      );
    },
    verify() {
      if (!this.$refs.form2.validate()) {
        return;
      }

      this.processing = true;
      this.errorMsg = "";
      axios({
        method: "GET",
        url: this.appConfig.$api_url + "/api/users/verify?type=0&secret=" + this.secret,
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
          if (error.response && error.response.data) {
            this.errorMsg = error.response.data;
          } else {
            this.errorMsg = axiosErrorHandler.handle(error);
          }
        }
      );
    },
    finalize() {
      if (!this.$refs.form3.validate()) {
        return;
      }

      this.errorMsg = "";
      if (this.password != this.confirm) {
        this.errorMsg = "تکرار گذرواژه با گذرواژه وارد شده همخوانی ندارد.";
        return;
      }

      this.processing = true;
      axios({
        method: "POST",
        url: this.appConfig.$api_url + "/api/users/finalizesignup",
        data: {
          email: this.email,
          secret: this.secret,
          password: this.password,
          firstName: this.firstName,
          sureName: this.sureName,
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
          if (error.response && error.response.data) {
            this.errorMsg = error.response.data;
          } else {
            this.errorMsg = axiosErrorHandler.handle(error);
          }
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
          clientAppName: "Museum Clinet Web UI",
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
          if (error.response && error.response.data) {
            this.errorMsg = error.response.data;
          } else {
            this.errorMsg = axiosErrorHandler.handle(error);
          }
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
