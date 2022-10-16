<template>
  <div class="user">
    <v-content class="pa-0">
      <v-layout justify-space-around v-if="errMsg != ''" color="primary">
        <v-card>
          <v-alert type="error">
            {{ errMsg }}
          </v-alert>
        </v-card>
      </v-layout>
      <v-layout justify-space-around v-if="userInfo == null" color="primary">
        <v-form ref="loginForm" v-model="valid" lazy-validation>
          <v-card>
            <v-card-text>
              <v-text-field
                prepend-inner-icon="person"
                v-model="input.username"
                :rules="input.usernameRules"
                required
                label="پست الکترونیکی"
                class="ltrinput"
              ></v-text-field>
            </v-card-text>
            <v-card-text>
              <v-text-field
                prepend-inner-icon="lock"
                v-model="input.password"
                type="password"
                :rules="input.passwordRules"
                required
                label="گذرواژه"
                class="ltrinput"
              ></v-text-field>
            </v-card-text>
            <v-card-text>
              <v-flex xs12 text-center>
                <v-btn color="success" v-on:click="signin()">ورود</v-btn>
              </v-flex>
            </v-card-text>
            <v-card-text>
              <v-flex xs12 text-center>
                <v-btn color="accent" v-on:click="signup()">ثبت نام</v-btn>
              </v-flex>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-text>
              <v-flex xs12 text-center>
                <v-btn color="warn" v-on:click="forgotpassword()"
                  >فراموشی گذرواژه</v-btn
                >
              </v-flex>
            </v-card-text>
          </v-card>
        </v-form>
        <v-layout justify-space-around v-if="processing" color="primary">
          <v-progress-linear indeterminate></v-progress-linear>
        </v-layout>
      </v-layout>

      <v-layout wrap>
        <v-flex xs12 text-center v-if="userInfo != null">
          <router-link to="/profile">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-icon
                  v-if="userInfo.user.rImageId == null"
                  size="196"
                  v-on="on"
                  class="clickable"
                  >account_circle</v-icon
                >
                <v-img
                  v-if="userInfo.user.rImageId != null"
                  max-width="196"
                  max-height="196"
                  v-on="on"
                  class="clickable centeredimg"
                  :src="`${appConfig.$api_url}/api/rimages/${userInfo.user.rImageId}.jpg`"
                ></v-img>
              </template>
              <span>ویرایش مشخصات و تغییر گذرواژه</span>
            </v-tooltip>
          </router-link>
          <div>
            <v-chip color="primary">
              سلام {{ userInfo.user.firstName }} {{ userInfo.user.sureName }}!
            </v-chip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-chip color="red" dark v-on="on">
                  <v-icon dark v-on:click="signout()">directions_run</v-icon>
                </v-chip>
              </template>
              <span>خروج</span>
            </v-tooltip>
          </div>
        </v-flex>
        <v-flex xs12 text-center v-if="userInfo != null">
          <v-card>
            <v-card-text>
              <router-link to="/bookmarks">
                <v-btn color="primary"
                  >نشان شده‌ها<v-icon left color="yellow">star</v-icon></v-btn
                >
              </router-link>
            </v-card-text>
          </v-card>
        </v-flex>
        <v-flex xs12 text-center v-if="userInfo != null">
          <v-card>
            <v-card-text>
              <router-link to="/mynotes/type/public">
                <v-btn color="primary"
                  >یادداشتهای عمومی من<v-icon color="green" left
                    >notes</v-icon
                  ></v-btn
                >
              </router-link>
            </v-card-text>
          </v-card>
        </v-flex>
        <v-flex xs12 text-center v-if="userInfo != null">
          <v-card>
            <v-card-text>
              <router-link to="/mynotes/type/private">
                <v-btn color="primary"
                  >یادداشتهای شخصی من<v-icon color="red" left
                    >notes</v-icon
                  ></v-btn
                >
              </router-link>
            </v-card-text>
          </v-card>
        </v-flex>
        <v-flex xs12 text-center v-if="userInfo != null">
          <v-card>
            <v-card-text>
              <router-link to="/notifications">
                <v-btn color="primary">
                  اعلانهای من
                  <v-icon v-if="unreadNotificationsCount == 0" left
                    >notifications</v-icon
                  >
                  <v-badge
                    v-if="unreadNotificationsCount != 0"
                    left
                    color="red"
                  >
                    <template v-slot:badge>
                      <span>{{ unreadNotificationsCount }}</span>
                    </template>
                    <v-icon color="red">notifications</v-icon>
                  </v-badge>
                </v-btn>
              </router-link>
            </v-card-text>
          </v-card>
        </v-flex>
        <v-flex xs12 text-center v-if="checkPermission('user', 'view')">
          <v-card>
            <v-card-text>
              <router-link to="/users">
                <v-btn color="primary"
                  >مدیریت کاربران<v-icon left>supervisor_account</v-icon></v-btn
                >
              </router-link>
            </v-card-text>
          </v-card>
        </v-flex>
        <v-flex xs12 text-center v-if="checkPermission('role', 'view')">
          <v-card>
            <v-card-text>
              <router-link to="/roles">
                <v-btn color="primary"
                  >مدیریت نقشها<v-icon left
                    >supervised_user_circle</v-icon
                  ></v-btn
                >
              </router-link>
            </v-card-text>
          </v-card>
        </v-flex>
        <v-flex xs12 text-center v-if="checkPermission('artifact', 'ganjoor')">
          <v-card>
            <v-card-text>
              <router-link to="/glinkrev">
                <v-btn color="primary"
                  >بازبینی ارتباطات<v-icon left>done</v-icon></v-btn
                >
              </router-link>
            </v-card-text>
          </v-card>
          <v-card>
            <v-card-text>
              <router-link to="/plinkrev">
                <v-btn color="red"
                  >بازبینی تصاویر<v-icon left>done</v-icon></v-btn
                >
              </router-link>
            </v-card-text>
          </v-card>
        </v-flex>
        <v-flex xs12 text-center v-if="checkPermission('note', 'moderate')">
          <v-card>
            <v-card-text>
              <router-link to="/reported">
                <v-btn color="primary"
                  >یادداشتهای گزارش شده<v-icon left>flag</v-icon></v-btn
                >
              </router-link>
            </v-card-text>
          </v-card>
        </v-flex>
        <v-flex xs12 text-center v-if="checkPermission('audit', 'view')">
          <v-card>
            <v-card-text>
              <router-link to="/logs">
                <v-btn color="primary"
                  >رویدادها<v-icon left>event</v-icon></v-btn
                >
              </router-link>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-content>
  </div>
</template>

<script>
import axios from "axios";
import { EventBus } from "../event-bus";
import axiosErrorHandler from "./../utilities/axiosErrorHandler";
import PermissionChecker from "./../utilities/PermissionChecker";

export default {
  name: "UserSidebarWidget",
  data() {
    return {
      valid: true,
      input: {
        username: "",
        usernameRules: [
          (v) => !!v || "لطفا ایمیل خود را وارد نمایید",
          (v) => /.+@.+\..+/.test(v) || "ایمیل وارد شده معتبر نیست",
        ],
        password: "",
        passwordRules: [(v) => !!v || "لطفا کلمه عبور خود را وارد نمایید"],
        clientAppName: "Museum Clinet Web UI",
        language: "fa-IR",
      },
      userInfo: null,
      errMsg: "",
      processing: false,
      unreadNotificationsCount: 0,
    };
  },
  mounted() {
    if (localStorage.getItem("userInfo")) {
      try {
        this.userInfo = JSON.parse(localStorage.getItem("userInfo"));
      } catch (e) {
        localStorage.removeItem("userInfo");
      }
    }

    EventBus.$on("user-logged-in", this.userLoggedIn);
    EventBus.$on("user-logged-out", this.userLoggedOut);
    this.refreshNotificationsCount();
  },
  methods: {
    userLoggedIn(userInfo) {
      this.userInfo = userInfo;
      this.refreshNotificationsCount();
    },
    refreshNotificationsCount() {
      if (this.userInfo != null) {
        this.processing = true;
        axios({
          method: "GET",
          url: this.appConfig.$api_url + "/api/notifications/unread/count",
          data: {},
          headers: {
            "content-type": "application/json",
            authorization: "bearer " + this.userInfo.token,
          },
        }).then(
          (result) => {
            this.unreadNotificationsCount = result.data;
            this.processing = false;
          },
          (error) => {
            this.processing = false;
            if (error.response && error.response.status == 401) {
              //probably session expired
              this.signout();
            } else {
              this.errMsg = axiosErrorHandler.handle(error);
            }
          }
        );
      }
    },

    userLoggedOut() {
      this.userInfo = null;
    },
    signin() {
      var clientValidation = this.$refs.loginForm.validate();
      if (!clientValidation) {
        return;
      }

      this.processing = true;
      this.errMsg = "";
      axios({
        method: "POST",
        url: this.appConfig.$api_url + "/api/users/login",
        data: this.input,
        headers: { "content-type": "application/json" },
      }).then(
        (result) => {
          localStorage.setItem("userInfo", JSON.stringify(result.data));
          this.userInfo = result.data;
          EventBus.$emit("user-logged-in", this.userInfo);
          this.processing = false;
        },
        (error) => {
          this.processing = false;
          this.errMsg = axiosErrorHandler.handle(error);
        }
      );
    },
    signup() {
      EventBus.$emit("signing-up", this.userInfo);
      this.$router.push("/signup");
    },
    forgotpassword() {
      EventBus.$emit("signing-up", this.userInfo);
      if (this.input.username != "") {
        this.$router.push("/forgot-password?email=" + this.input.username);
      } else {
        this.$router.push("/forgot-password");
      }
    },
    signout() {
      axios({
        method: "DELETE",
        url:
          this.appConfig.$api_url +
          "/api/users/delsession?userId=" +
          this.userInfo.user.id +
          "&sessionId=" +
          this.userInfo.sessionId,
        headers: {
          "content-type": "application/json",
          authorization: "bearer " + this.userInfo.token,
        },
      }).then(
        () => {
          localStorage.removeItem("userInfo");
          this.userInfo = null;
          EventBus.$emit("user-logged-out", this.userInfo);
          this.$router.push("/");
        },
        (error) => {
          localStorage.removeItem("userInfo");
          this.userInfo = null;
          this.errMsg = error;
          EventBus.$emit("user-logged-out");
          this.$router.push("/");
        }
      );
    },
    checkPermission(secShortName, opShortName) {
      return PermissionChecker.check(this.userInfo, secShortName, opShortName);
    },
  },
};
</script>

<style>
h1,
h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}

.ltrinput {
  direction: ltr;
}

.clickable {
  cursor: pointer;
}

.centeredimg {
  margin: auto;
}
</style>
