<template>
  <v-container grid-list-md text-center fill-height>
    <v-layout wrap>
      <v-flex v-if="users == null" xs12>
        <v-card dark color="secondary">
          <v-progress-circular indeterminate></v-progress-circular>
        </v-card>
      </v-flex>
      <v-flex v-if="errMsg != ''" xs12>
        <v-card>
          <v-card-text>
            {{ errMsg }}
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex v-if="users != null" xs12>
        <v-data-table
          :headers="headers"
          :items="users"
          :single-expand="true"
          :expanded.sync="expanded"
          item-key="id"
          show-expand
          :loading="loading"
          :server-items-length="totalUsers"
          :footer-props="{
            showFirstLastPage: true,
            firstIcon: 'first_page',
            lastIcon: 'last_page',
            prevIcon: 'keyboard_arrow_left',
            nextIcon: 'keyboard_arrow_right',
            'items-per-page-options': [15, 50, 100, -1],
          }"
          :item-expanded="tableItemExpanded()"
          @update:page="updatePage"
          @update:options="updateOptions"
          class="elevation-1"
        >
          <template v-slot:top>
            <v-toolbar flat color="white">
              <v-toolbar-title>مدیریت کاربران</v-toolbar-title>
              <div class="flex-grow-1"></div>
              <v-text-field
                label="جستجوی ایمیل"
                v-model="filterByEmail"
              ></v-text-field>
              <v-btn
                class="mx-2"
                fab
                dark
                x-small
                color="indigo"
                @click="enumerateUsers"
              >
                <v-icon dark>search</v-icon>
              </v-btn>
            </v-toolbar>
          </template>
          <template v-slot:expanded-item="{ headers }">
            <td :colspan="headers.length">
              <v-chip
                v-for="role in roles"
                :key="role.name"
                close
                color="green"
                @click:close="deleteUserRole(role)"
              >
                {{ role }}
              </v-chip>
              <v-btn
                class="mx-2"
                fab
                dark
                x-small
                color="indigo"
                @click="addUserRole()"
              >
                <v-icon dark>add</v-icon>
              </v-btn>
              <v-checkbox
                v-model="userStatus"
                label="فعال"
                @change="changeUserStatus()"
              ></v-checkbox>
            </td>
          </template>
        </v-data-table>
      </v-flex>
    </v-layout>
    <!-- add user to role begin -->
    <v-dialog v-model="showRoleSelectDialog" width="500">
      <v-card>
        <v-card-text>
          <v-select
            v-model="selectedRole"
            :items="unassignedRoleArray"
            label="نقش"
            hint="نقش"
            persistent-hint
            return-object
            single-line
          ></v-select>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="onAddToRoleOKClicked()">تأیید</v-btn>
          <v-btn color="secondary" text @click="showRoleSelectDialog = false"
            >انصراف</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- add user to role end -->
  </v-container>
</template>

<script>
import axios from "axios";
import { EventBus } from "./../event-bus";
import axiosErrorHandler from "./../utilities/axiosErrorHandler";

export default {
  name: "Users",
  data() {
    return {
      userInfo: null,
      errMsg: "",
      headers: [
        { text: "پست الکترونیکی", value: "email" },
        { text: "نام", value: "firstName" },
        { text: "نام خانوادگی", value: "surName" },
        { text: "#", value: "id" },
      ],
      users: null,
      expanded: [],
      roles: [],
      showRoleSelectDialog: false,
      selectedRole: "",
      unassignedRoleArray: [],
      allroles: [],
      userStatus: false,
      pageSize: 15,
      pageNumber: 1,
      totalUsers: 0,
      loading: true,
      filterByEmail: "",
    };
  },
  mounted() {
    document.title = "گنجینهٔ گنجور - مدیریت کاربران";
    if (localStorage.getItem("userInfo")) {
      try {
        this.userInfo = JSON.parse(localStorage.getItem("userInfo"));
      } catch (e) {
        this.userInfo = null;
      }
    }

    EventBus.$on("user-logged-in", this.userLoggedIn);
    EventBus.$on("user-logged-out", this.userLoggedOut);

    this.enumerateUsers();
  },
  methods: {
    enumerateUsers() {
      this.loading = true;
      axios({
        method: "GET",
        url:
          this.appConfig.$api_url +
          "/api/users?PageNumber=" +
          this.pageNumber +
          "&PageSize=" +
          this.pageSize +
          "&filterByEmail=" +
          this.filterByEmail,
        data: {},
        headers: {
          authorization: "bearer " + this.userInfo.token,
          "content-type": "application/json",
        },
      }).then(
        (result) => {
          this.users = result.data;
          this.totalUsers = JSON.parse(
            result.headers["paging-headers"]
          ).totalCount;
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          this.errMsg = "users: " + axiosErrorHandler.handle(error);
        }
      );

      axios({
        method: "GET",
        url: this.appConfig.$api_url + "/api/roles",
        data: {},
        headers: {
          authorization: "bearer " + this.userInfo.token,
          "content-type": "application/json",
        },
      }).then(
        (result) => {
          this.allroles = [];
          for (var i = 0; i < result.data.length; i++) {
            this.allroles.push(result.data[i].name);
          }
        },
        (error) => {
          this.errMsg = "roles: " + axiosErrorHandler.handle(error);
        }
      );
    },
    userLoggedIn(userInfo) {
      this.userInfo = userInfo;
    },
    userLoggedOut() {
      this.userInfo = null;
    },
    updatePage(pageNumber) {
      this.pageNumber = pageNumber;
      this.enumerateEvents();
    },
    updateOptions(options) {
      this.pageSize = options.itemsPerPage;
      this.pageNumber = options.page;
      this.enumerateUsers();
    },
    tableItemExpanded() {
      if (this.expanded == null) {
        return;
      }
      if (this.expanded.length == 0) {
        return;
      }
      this.userStatus = this.expanded[0].status == 1;
      this.enumerateUserRoles(this.expanded[0].id);
    },
    enumerateUserRoles(userId) {
      axios({
        method: "GET",
        url: this.appConfig.$api_url + "/api/users/" + userId + "/roles",
        data: {},
        headers: {
          authorization: "bearer " + this.userInfo.token,
          "content-type": "application/json",
        },
      }).then(
        (result) => {
          this.roles = result.data;
        },
        (error) => {
          this.errMsg = axiosErrorHandler.handle(error);
        }
      );
    },
    deleteUserRole(role) {
      this.errMsg = "";
      var userId = this.expanded[0].id;
      axios({
        method: "DELETE",
        url:
          this.appConfig.$api_url + "/api/users/" + userId + "/roles/" + role,
        data: {},
        headers: {
          authorization: "bearer " + this.userInfo.token,
          "content-type": "application/json",
        },
      }).then(
        (result) => {
          if (result) {
            this.enumerateUserRoles(userId);
          } else {
            this.errMsg = "حذف نقش برای کاربر موفق نبود.";
          }
        },
        (error) => {
          this.errMsg = axiosErrorHandler.handle(error);
        }
      );
    },
    addUserRole() {
      this.errMsg = "";
      this.unassignedRoleArray = [];
      for (var i = 0; i < this.allroles.length; i++) {
        var found = false;
        for (var j = 0; j < this.roles.length; j++) {
          if (this.allroles[i] === this.roles[j]) {
            found = true;
            break;
          }
        }

        if (!found) {
          this.unassignedRoleArray.push(this.allroles[i]);
        }
      }
      if (this.unassignedRoleArray.length > 0) {
        this.selectedRole = this.unassignedRoleArray[0];
      }
      this.showRoleSelectDialog = true;
    },
    onAddToRoleOKClicked() {
      this.errMsg = "";
      var userId = this.expanded[0].id;
      axios({
        method: "POST",
        url:
          this.appConfig.$api_url +
          "/api/users/" +
          userId +
          "/roles/" +
          this.selectedRole,
        data: {},
        headers: {
          authorization: "bearer " + this.userInfo.token,
          "content-type": "application/json",
        },
      }).then(
        (result) => {
          if (result) {
            this.enumerateUserRoles(userId);
          } else {
            this.errMsg = "اضافه کردن نقش برای کاربر موفق نبود.";
          }
          this.showRoleSelectDialog = false;
        },
        (error) => {
          this.errMsg = axiosErrorHandler.handle(error);
          this.showRoleSelectDialog = false;
        }
      );
    },
    changeUserStatus() {
      this.errMsg = "";
      var userId = this.expanded[0].id;
      for (var i = 0; i < this.users.length; i++) {
        if (this.users[i].id === userId) {
          var newStaus = 0;
          if (this.userStatus) {
            newStaus = 1;
          }

          axios({
            method: "PUT",
            url: this.appConfig.$api_url + "/api/users/" + userId,
            data: {
              password: "",
              isAdmin: this.users[i].isAdmin,
              id: userId,
              username: this.users[i].username,
              email: this.users[i].email,
              phoneNumber: this.users[i].phoneNumber,
              firstName: this.users[i].firstName,
              surName: this.users[i].surName,
              status: newStaus,
              rImageId: this.users[i].rImageId,
            },
            headers: {
              authorization: "bearer " + this.userInfo.token,
              "content-type": "application/json",
            },
          }).then(
            (result) => {
              if (!result) {
                this.errMsg = "تغییر وضعیت کاربر غیرفعال نبود.";
              } else {
                this.users[i].status = newStaus;
              }
            },
            (error) => {
              this.errMsg = axiosErrorHandler.handle(error);
            }
          );

          break;
        }
      }
    },
  },
};
</script>

<style scoped>
</style>