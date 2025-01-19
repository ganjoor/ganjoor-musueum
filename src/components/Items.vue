<template>
  <v-container grid-list-sm fluid>
    <v-layout row wrap align-center text-center fill-height>
      <v-flex v-if="loading" xs12>
        <v-card dark color="secondary">
          <v-progress-circular indeterminate></v-progress-circular>
        </v-card>
      </v-flex>
      <v-flex v-if="!loading" xs12>
        <v-card>
          <div class="text-center">
            <v-pagination
              v-model="pageNumber"
              :length="pageCount"
              circle
              prev-icon="mdi-menu-right"
              next-icon="mdi-menu-left"
              @input="pageNumberChanged"
            ></v-pagination>
          </div>
        </v-card>
      </v-flex>
      <v-flex v-for="item in items" :key="item.id" d-flex>
        <v-card flat dark raised style="width: 200px" class="d-flex">
          <router-link :to="`/items/${item.friendlyUrl}`">
            <v-img
              :src="`${item.coverImage.externalNormalSizeImageUrl
                .replace('/norm/', '/thumb/')
                .replace('/orig/', '/thumb/')}`"
              width="200px"
              class="grey lighten-2 clickable"
            >
              <template v-slot:placeholder>
                <v-layout fill-height align-center justify-center ma-0>
                  <v-progress-circular
                    indeterminate
                    color="grey lighten-5"
                  ></v-progress-circular>
                </v-layout>
              </template>
            </v-img>
            <v-card-subtitle style="color: lightgray">
              {{ item.name }}
            </v-card-subtitle>
          </router-link>
        </v-card>
      </v-flex>
      <v-flex v-if="!loading" xs12>
        <v-card>
          <div class="text-center">
            <v-pagination
              v-model="pageNumber"
              :length="pageCount"
              circle
              prev-icon="mdi-menu-right"
              next-icon="mdi-menu-left"
              @input="pageNumberChanged"
            ></v-pagination>
          </div>
        </v-card>
      </v-flex>
      <v-flex v-if="errorMsg != ''" xs12>
        <v-card dark color="secondary">
          <v-card-text>{{ errorMsg }}</v-card-text>
        </v-card>
      </v-flex>
      <p style="margin-top: 200px"></p>
    </v-layout>
  </v-container>
</template>
<script>
import axios from "axios";
import axiosErrorHandler from "./../utilities/axiosErrorHandler";
import { EventBus } from "./../event-bus";

export default {
  name: "Items",
  data() {
    return {
      userInfo: null,
      items: [],
      pageSize: 50,
      pageNumber: 1,
      pageCount: 0,
      errorMsg: "",
      loading: true,
    };
  },
  mounted() {
    document.title = "گنجینهٔ گنجور - مشاهدهٔ همه نسخه‌ها";
    if (localStorage.getItem("userInfo")) {
      try {
        this.userInfo = JSON.parse(localStorage.getItem("userInfo"));
      } catch (e) {
        this.userInfo = null;
      }
    }

    EventBus.$on("user-logged-in", this.userLoggedIn);
    EventBus.$on("user-logged-out", this.userLoggedOut);

    this.loadArtifacts();
  },
  methods: {
    userLoggedIn(userInfo) {
      this.userInfo = userInfo;
      this.loadArtifacts();
    },
    userLoggedOut() {
      this.userInfo = null;
      this.loadArtifacts();
    },
    loadArtifacts() {
      this.loading = true;
      this.pageNumber = 1;
      if (this.$route.params.pageno != null) {
        this.pageNumber = parseInt(this.$route.params.pageno);
      }
      document.title =
        "گنجینهٔ گنجور - مشاهدهٔ همه نسخه‌ها - صفحهٔ " + this.pageNumber;
      if (this.userInfo == null) {
        axios({
          method: "GET",
          url:
            this.appConfig.$api_url +
            "/api/artifacts?PageNumber=" +
            this.pageNumber +
            "&PageSize=" +
            this.pageSize,
          data: {},
          headers: { "content-type": "application/json" },
        }).then(
          (result) => {
            this.handleArtifactsResults(result);
          },
          (error) => {
            this.handleArtifactsError(error);
          }
        );
      } else {
        axios({
          method: "GET",
          url:
            this.appConfig.$api_url +
            "/api/artifacts/secure?PageNumber=" +
            this.pageNumber +
            "&PageSize=" +
            this.pageSize,
          data: {},
          headers: {
            "content-type": "application/json",
            authorization: "bearer " + this.userInfo.token,
          },
        }).then(
          (result) => {
            this.handleArtifactsResults(result);
          },
          (error) => {
            this.handleArtifactsError(error);
          }
        );
      }
    },
    handleArtifactsResults(result) {
      this.items = result.data;
      this.pageCount = JSON.parse(result.headers["paging-headers"]).totalPages;
      this.loading = false;
    },
    handleArtifactsError(error) {
      this.errorMsg = axiosErrorHandler.handle(error);
      this.loading = false;
    },
    pageNumberChanged(pageNumber) {
      this.$router.push("/items/pageno/" + pageNumber);
      this.loadArtifacts();
    },
  },
};
</script>
<style>
.clickable {
  cursor: pointer;
}
</style>