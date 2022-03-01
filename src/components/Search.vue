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
            {{ artifacts.length }} نسخه
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
          <v-card-text>
            <v-btn
              color="success"
              v-if="!loadingItems && items.length < itemsTotalCount"
              class="mr-4"
              v-on:click="loadMoreItems()"
              >بیشتر</v-btn
            >
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
      artifactsPageCount: 0,
      artifactsTotalCount: 0,
      items: [],
      loadingItems: true,
      errorMsgItems: "",
      itemsPageNumber: 1,
      itemsPageCount: 0,
      itemsTotalCount: 0,
    };
  },
  methods: {
    loadItems() {
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
          this.itemsPageCount = JSON.parse(
            result.headers["paging-headers"]
          ).totalPages;
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
  },
  mounted() {
    this.term = this.$route.query.q;

    this.loadingArtifacts = true;
    axios({
      method: "GET",
      url:
        this.appConfig.$api_url +
        "/api/artifacts/search?term=" +
        encodeURIComponent(this.term),
      data: {},
      headers: { "content-type": "application/json" },
    }).then(
      (result) => {
        this.artifacts = result.data;

        this.loadingArtifacts = false;
      },
      (error) => {
        this.errorMsgArtifacts = error;
        this.loadingArtifacts = false;
      }
    );
    this.loadItems();
  },
};
</script>

<style scoped>
</style>