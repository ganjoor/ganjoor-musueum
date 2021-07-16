<template>
  <v-container grid-list-md text-center fill-height>
    <v-layout wrap>
      <v-flex v-if="errMsg != ''" xs12>
        <v-card>
          <v-card-text>
            {{ errMsg }}
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex v-if="events != null" xs12>
        <v-data-table
          dense
          show-select
          single-select
          :headers="headers"
          :items="events"
          :loading="loading"
          :server-items-length="totalEvents"
          :footer-props="{
            showFirstLastPage: true,
            firstIcon: 'first_page',
            lastIcon: 'last_page',
            prevIcon: 'keyboard_arrow_left',
            nextIcon: 'keyboard_arrow_right',
            'items-per-page-options': [15, 50, 100, -1],
          }"
          :sort-by.sync="sortBy"
          :sort-desc.sync="sortDesc"
          @update:sort-desc="toggleOrder"
          @update:page="updatePage"
          @update:options="updateOptions"
          @item-selected="itemSelected"
          class="elevation-1"
        >
          <template v-slot:top>
            <v-toolbar flat color="white">
              <v-toolbar-title>رویدادها</v-toolbar-title>
              <div class="flex-grow-1"></div>
              <v-text-field
                label="فیلتر کاربر (دقیق)"
                v-model="userName"
              ></v-text-field>
              <v-btn
                class="mx-2"
                fab
                dark
                x-small
                color="indigo"
                @click="enumerateEvents"
              >
                <v-icon dark>search</v-icon>
              </v-btn>
            </v-toolbar>

            <v-card>
              <v-card-text>
                {{ jsonData }}
              </v-card-text>
            </v-card>
          </template>
        </v-data-table>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import axios from "axios";
import { EventBus } from "./../event-bus";
import axiosErrorHandler from "./../utilities/axiosErrorHandler";
export default {
  name: "Events",
  data() {
    return {
      userInfo: null,
      errMsg: "",
      headers: [
        { text: "رویداد", value: "eventType" },
        { text: "زمان", value: "startDate" },
        { text: "مدت", value: "duration" },
        { text: "کاربر", value: "userName" },
        { text: "آیپی", value: "ipAddress" },
        { text: "کد پاسخ", value: "responseStatusCode" },
      ],
      events: null,
      pageSize: 15,
      pageNumber: 1,
      totalEvents: 0,
      loading: true,
      jsonData: null,
      userName: "",
      sortBy: "startDate",
      sortDesc: true,
    };
  },
  mounted() {
    document.title = "گنجینهٔ گنجور - رویدادها";
    if (localStorage.getItem("userInfo")) {
      try {
        this.userInfo = JSON.parse(localStorage.getItem("userInfo"));
      } catch (e) {
        this.userInfo = null;
      }
    }

    EventBus.$on("user-logged-in", this.userLoggedIn);
    EventBus.$on("user-logged-out", this.userLoggedOut);

    this.enumerateEvents();
  },
  methods: {
    enumerateEvents() {
      this.loading = true;
      axios({
        method: "GET",
        url:
          this.appConfig.$api_url +
          "/api/auditlogs?orderByTimeDescending=" +
          this.sortDesc +
          "&userName=" +
          this.userName +
          "&PageNumber=" +
          this.pageNumber +
          "&PageSize=" +
          this.pageSize,
        data: {},
        headers: {
          authorization: "bearer " + this.userInfo.token,
          "content-type": "application/json",
        },
      }).then(
        (result) => {
          this.totalEvents = JSON.parse(
            result.headers["paging-headers"]
          ).totalCount;
          this.events = result.data;

          this.loading = false;
        },
        (error) => {
          this.loading = false;
          this.errMsg = "events: " + axiosErrorHandler.handle(error);
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
      this.enumerateEvents();
    },
    itemSelected(item) {
      this.jsonData = "";
      this.userName = "";
      if (item.value) {
        this.jsonData = item.item.jsonData;
        this.userName = item.item.userName;
      }
    },
    toggleOrder(value) {
      this.sortDesc = value;
      this.sortBy = "startDate";
      this.pageNumber = 1;
      this.enumerateEvents();
    },
  },
};
</script>

<style scoped>
</style>