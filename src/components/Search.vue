<template>
  <v-container grid-list-md text-center>
    <v-layout wrap>
      <v-flex xs4>
        <v-card light v-if="term != null">
          <v-card-text> جستجوی {{ term }} </v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs4>
        <v-card>
          <v-flex v-if="errorMsgArtifacts != ''" xs12>
            <v-card dark color="secondary">
              <v-card-text>{{ errorMsgArtifacts }}</v-card-text>
            </v-card>
          </v-flex>
          <v-flex v-if="loadingArtifacts" xs12>
            <v-card dark color="secondary">
              <v-progress-circular indeterminate></v-progress-circular>
            </v-card>
          </v-flex>
          <v-card-text v-if="!loadingArtifacts && artifacts != null">
            {{ artifactsTotalCount }} نسخه
          </v-card-text>
          <v-container v-if="artifacts != null" grid-list-sm fluid>
            <v-layout row wrap>
              <v-flex v-for="item in artifacts" :key="item.id" d-flex>
                <v-card flat raised dark class="d-flex" style="width: 200px">
                  <router-link :to="`/items/${item.friendlyUrl}`">
                    <v-img
                      :src="`${appConfig.$api_url}/api/images/thumb/${item.coverImage.id}.jpg`"
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
            </v-layout>
          </v-container>
          <v-card-text v-if="artifacts.length < artifactsTotalCount">
            <v-btn
              color="success"
              class="mr-4"
              v-if="!loadingArtifacts"
              v-on:click="loadMoreArtficats()"
              >بیشتر</v-btn
            >
            <v-card v-if="loadingArtifacts" dark color="secondary">
              <v-progress-circular indeterminate></v-progress-circular>
            </v-card>
          </v-card-text>
        </v-card>
      </v-flex>

      <v-flex xs4>
        <v-card>
          <v-flex v-if="errorMsgItems != ''" xs12>
            <v-card dark color="secondary">
              <v-card-text>{{ errorMsgItems }}</v-card-text>
            </v-card>
          </v-flex>
          <v-flex v-if="loadingItems" xs12>
            <v-card dark color="secondary">
              <v-progress-circular indeterminate></v-progress-circular>
            </v-card>
          </v-flex>
          <v-card-text v-if="!loadingItems">
            {{ itemsTotalCount }} تصویر
          </v-card-text>
          <v-container grid-list-sm fluid>
            <v-layout row wrap>
              <v-flex v-for="item in items" :key="item.id" d-flex>
                <v-card flat raised dark class="d-flex" style="width: 200px">
                  <router-link
                    :to="`/items/${item.parentFriendlyUrl}/${item.item.friendlyUrl}`"
                  >
                    <v-img
                      :src="`${appConfig.$api_url}/api/images/thumb/${item.item.images[0].id}.jpg`"
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
                      {{ item.item.name }}
                    </v-card-subtitle>
                  </router-link>
                </v-card>
              </v-flex>
            </v-layout>
          </v-container>
          <v-card-text v-if="items.length < itemsTotalCount">
            <v-btn
              color="success"
              class="mr-4"
              v-if="!loadingItems"
              v-on:click="loadMoreItems()"
              >بیشتر</v-btn
            >
            <v-card v-if="loadingItems" dark color="secondary">
              <v-progress-circular indeterminate></v-progress-circular>
            </v-card>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  name: "Search",
  data() {
    return {
      term: null,
      pageSize: 50,
      artifacts: [],
      loadingArtifacts: true,
      errorMsgArtifacts: "",
      artifactsPageNumber: 1,
      artifactsTotalCount: 0,
      items: [],
      loadingItems: true,
      errorMsgItems: "",
      itemsPageNumber: 1,
      itemsTotalCount: 0,
    };
  },
  methods: {
    loadItems() {
      if (this.term == null || this.term == "") {
        this.errorMsgItems = "جستجوی عبارت خالی امکان ندارد.";
        return;
      }

      this.errorMsgItems = "";
      this.loadingItems = true;

      axios({
        method: "GET",
        url:
          this.appConfig.$api_url +
          "/api/artifacts/search/items?term=" +
          encodeURIComponent(this.term) +
          "&PageNumber=" +
          this.itemsPageNumber +
          "&PageSize=" +
          this.pageSize,
        data: {},
        headers: { "content-type": "application/json" },
      }).then(
        (result) => {
          this.itemsTotalCount = JSON.parse(
            result.headers["paging-headers"]
          ).totalCount;
          for (let index = 0; index < result.data.length; index++) {
            this.items.push(result.data[index]);
          }
          this.loadingItems = false;
        },
        (error) => {
          this.errorMsgItems = error;
          this.loadingItems = false;
        }
      );
    },
    loadMoreItems() {
      this.itemsPageNumber++;
      this.loadItems();
    },
    loadArtifacts() {
      if (this.term == null || this.term == "") {
        this.errorMsgArtifacts = "جستجوی عبارت خالی امکان ندارد.";
        return;
      }
      this.errorMsgArtifacts = "";
      this.loadingArtifacts = true;
      axios({
        method: "GET",
        url:
          this.appConfig.$api_url +
          "/api/artifacts/search?term=" +
          encodeURIComponent(this.term) +
          "&PageNumber=" +
          this.artifactsPageNumber +
          "&PageSize=" +
          this.pageSize,
        data: {},
        headers: { "content-type": "application/json" },
      }).then(
        (result) => {
          this.artifactsTotalCount = JSON.parse(
            result.headers["paging-headers"]
          ).totalCount;
          for (let index = 0; index < result.data.length; index++) {
            this.artifacts.push(result.data[index]);
          }

          this.loadingArtifacts = false;
        },
        (error) => {
          this.errorMsgArtifacts = error;
          this.loadingArtifacts = false;
        }
      );
    },
    loadMoreArtficats() {
      this.artifactsPageNumber++;
      this.loadArtifacts();
    },
  },
  created() {
    this.$watch(
      () => this.$route.query,
      () => {
        this.term = this.$route.query.q;
        this.items = [];
        this.artifacts = [];
        this.itemsPageNumber = 1;
        this.errorMsgItems = "";
        this.artifactsPageNumber = 1;
        this.errorMsgArtifacts = "";
        this.loadArtifacts();
        this.loadItems();
      }
    );
  },
  mounted() {
    this.term = this.$route.query.q;
    this.loadArtifacts();
    this.loadItems();
  },
};
</script>

<style scoped>
</style>