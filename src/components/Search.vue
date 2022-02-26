<template>
  <v-container grid-list-md text-center>
    <v-layout wrap>
      <v-flex v-if="term == null" xs12>
        <v-card dark color="secondary">
          <v-progress-circular indeterminate></v-progress-circular>
        </v-card>
      </v-flex>

      <v-flex xs4>
        <v-card light v-if="term != null">
          <v-card-text>
            {{ term }}
          </v-card-text>
          <v-card-text v-if="items != null">
            {{ items.length }} عنوان
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs8>
        <v-card>
          <v-container v-if="items != null" grid-list-sm fluid>
            <v-layout row wrap>
              <v-flex v-for="item in items" :key="item.id" d-flex>
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
      items: [],
      itemsLength: 0,
      loading: true,
      errorMsg: "",
    };
  },
  mounted() {
    this.loading = true;
    this.term = this.$route.query.q;
    axios({
      method: "GET",
      url:
        this.appConfig.$api_url +
        "/api/artifacts/search?PageNumber=1&PageSize=10&term=" +
        encodeURIComponent(this.term),
      data: {},
      headers: { "content-type": "application/json" },
    }).then(
      (result) => {
        this.items = result.data;
        this.itemsLength = this.items.length;

        this.loading = false;
      },
      (error) => {
        this.errorMsg = error;
        this.loading = false;
      }
    );
  },
  methods: {},
};
</script>

<style scoped>
</style>