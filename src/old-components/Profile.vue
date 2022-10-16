<template>
  <v-container grid-list-md text-center>
    <v-layout wrap>
      <v-flex xs12 v-if="userInfo != null">
        <v-card>
          <v-card-text>
            <h2>ویرایش مشخصات</h2>
          </v-card-text>
        </v-card>
        <v-card>
          <v-card-text>
            <v-text-field
              prepend-inner-icon="email"
              v-model="userInfo.user.email"
              class="ltrinput"
              placeholder="پست الکترونیکی"
              disabled
            ></v-text-field>
          </v-card-text>
        </v-card>
        <v-card>
          <v-card-text>
            <v-icon v-if="userInfo.user.rImageId == null" size="196"
              >account_circle</v-icon
            >
            <v-img
              v-if="userInfo.user.rImageId != null"
              width="196"
              height="196"
              :src="`${appConfig.$api_url}/api/rimages/${userInfo.user.rImageId}.jpg`"
              class="centeredimg"
            ></v-img>
          </v-card-text>
          <v-card-text>
            <v-file-input
              accept="image/*"
              prepend-icon="mdi-camera"
              label="تصویر جدید"
              v-model="files"
            ></v-file-input>
            <v-btn
              color="green"
              class="ma-2 white--text"
              @click="handleImageUpload"
            >
              ارسال ‌<v-icon right dark>image</v-icon>
            </v-btn>
            <v-btn color="red" class="ma-2 white--text" @click="removeImage">
              حذف تصویر ‌<v-icon right dark>clear</v-icon>
            </v-btn>
          </v-card-text>
        </v-card>
        <v-layout justify-space-around v-if="errorMsg != ''" color="primary">
          <v-card color="red">
            <v-card-text>
              {{ errorMsg }}
            </v-card-text>
          </v-card>
        </v-layout>
        <v-card>
          <v-card-text>
            <h3>تغییر گذرواژه</h3>
          </v-card-text>
          <v-card-text>
            <p>
              گذرواژه باید شامل ۶ حرف باشد و از ترکیبی از اعداد و حروف انگلیسی
              تشکیل شده باشد.
            </p>
            <p>
              حروف و اعداد نباید تکراری باشند و وجود حداقل یک عدد و یک حرف کوچک
              انگلیسی در گذرواژه الزامی است.
            </p>
          </v-card-text>
          <v-card-text>
            <v-text-field
              prepend-inner-icon="lock"
              v-model="oldPassword"
              type="password"
              placeholder="گذرواژه فعلی"
              class="ltrinput"
            ></v-text-field>
          </v-card-text>
          <v-card-text>
            <v-text-field
              prepend-inner-icon="lock"
              v-model="newPassword"
              type="password"
              placeholder="گذرواژه جدید"
              class="ltrinput"
            ></v-text-field>
          </v-card-text>
          <v-card-text>
            <v-text-field
              prepend-inner-icon="lock"
              v-model="confirmPassword"
              type="password"
              placeholder="تکرار گذرواژه جدید"
              class="ltrinput"
            ></v-text-field>
          </v-card-text>
          <v-card-text>
            <v-btn
              color="green"
              class="ma-2 white--text"
              @click="changePassword"
            >
              تغییر گذرواژه ‌<v-icon right dark>edit</v-icon>
            </v-btn>
          </v-card-text>
        </v-card>
        <v-card>
          <v-card-text>
            <h3>تغییر مشخصات</h3>
          </v-card-text>
          <v-card-text>
            <v-text-field
              prepend-inner-icon="person"
              v-model="userInfo.user.firstName"
              placeholder="نام"
            ></v-text-field>
          </v-card-text>
          <v-card-text>
            <v-text-field
              prepend-inner-icon="person"
              v-model="userInfo.user.sureName"
              placeholder="نام خانوادگی"
            ></v-text-field>
          </v-card-text>
          <v-card-text>
            <v-btn color="green" class="ma-2 white--text" @click="updateUser">
              ذخیره ‌<v-icon right dark>edit</v-icon>
            </v-btn>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import axios from "axios";
import axiosErrorHandler from "./../utilities/axiosErrorHandler";

export default {
  name: "Profile",
  data() {
    return {
      userInfo: null,
      errorMsg: "",
      files: [],
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
  },
  mounted() {
    document.title = "گنجینهٔ گنجور - مشخصات من";
    if (localStorage.getItem("userInfo")) {
      try {
        this.userInfo = JSON.parse(localStorage.getItem("userInfo"));
      } catch (e) {
        this.userInfo = null;
      }
    }
  },
  methods: {
    handleImageUpload() {
      if (this.files.length == 0) {
        this.errorMsg = "لطفا تصویری را انتخاب کنید.";
        return;
      }
      this._handleImageUpload();
    },
    _handleImageUpload() {
      this.errorMsg = "";
      const data = new FormData();

      data.append("id", this.userInfo.user.id);
      data.append("file", this.files);

      axios({
        method: "POST",
        url: this.appConfig.$api_url + "/api/users/image",
        data: data,
        headers: {
          "content-type": "multipart/form-data",
          authorization: "bearer " + this.userInfo.token,
        },
      }).then(
        (result) => {
          if (this.files.length == 0) {
            this.userInfo.user.rImageId = null;
            this.userInfo.user.rImage = null;
          } else {
            this.userInfo.user.rImageId = result.data;
          }
          localStorage.setItem("userInfo", JSON.stringify(this.userInfo));
        },
        (error) => {
          this.errorMsg = axiosErrorHandler.handle(error);
        }
      );
    },

    removeImage() {
      this.files = [];
      this._handleImageUpload();
    },

    changePassword() {
      if (this.oldPassword == "") {
        this.errorMsg = "لطفا گذرواژهٔ فعلیتان را وارد کنید.";
        return;
      }
      if (this.newPassword != this.confirmPassword) {
        this.errorMsg = "تکرار گذرواژهٔ جدید همخوانی ندارد.";
        return;
      }
      axios({
        method: "POST",
        url: this.appConfig.$api_url + "/api/users/setmypassword",
        data: { oldPassword: this.oldPassword, newPassword: this.newPassword },
        headers: {
          "content-type": "application/json",
          authorization: "bearer " + this.userInfo.token,
        },
      }).then(
        () => {
          this.errorMsg = "گذراژهٔ شما به  درستی تغییر کرد.";
        },
        (error) => {
          this.errorMsg = axiosErrorHandler.handle(error);
        }
      );
    },

    updateUser() {
      this.errorMsg = "";
      axios({
        method: "PUT",
        url: this.appConfig.$api_url + "/api/users/" + this.userInfo.user.id,
        data: {
          password: "",
          isAdmin: this.userInfo.user.isAdmin,
          id: this.userInfo.user.id,
          username: this.userInfo.user.username,
          email: this.userInfo.user.email,
          phoneNumber: this.userInfo.user.phoneNumber,
          firstName: this.userInfo.user.firstName,
          sureName: this.userInfo.user.sureName,
          status: this.userInfo.user.status,
          rImageId: this.userInfo.user.rImageId,
        },
        headers: {
          authorization: "bearer " + this.userInfo.token,
          "content-type": "application/json",
        },
      }).then(
        (result) => {
          if (!result) {
            this.errorMsg = "تغییر مشخصات موفق نبود.";
          } else {
            this.errorMsg = "تغییر مشخصات انجام شد.";
            localStorage.setItem("userInfo", JSON.stringify(this.userInfo));
          }
        },
        (error) => {
          this.errorMsg = axiosErrorHandler.handle(error);
        }
      );
    },
  },
};
</script>

<style scoped>
.centeredimg {
  margin: auto;
}
.ltrinput {
  direction: ltr;
}
</style>