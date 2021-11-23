<template>
  <v-container grid-list-md text-center>
    <v-layout wrap>
      <v-flex xs12>
        <v-card v-if="loading" dark color="secondary">
          <v-progress-circular indeterminate></v-progress-circular>
        </v-card>
      </v-flex>
      <v-flex v-if="errorMsg != ''" xs12>
        <v-card dark color="secondary">
          <v-card-text>{{ errorMsg }}</v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs12>
        <v-card v-if="pageItems != null">
          <v-card-text v-for="report in pageItems" :key="report.id">
            <v-layout wrap>
              <v-flex xs4>
                <v-card>
                  <v-card-text>
                    <v-card dark>
                      <v-card-text>متن گزارش</v-card-text>
                    </v-card>
                  </v-card-text>
                  <v-card-text>
                    {{ report.reasonText }}
                  </v-card-text>
                </v-card>
              </v-flex>
              <v-flex xs8>
                <v-card>
                  <v-card-text>
                    <v-card dark>
                      <v-card-text> متن یادداشت</v-card-text>
                    </v-card>
                  </v-card-text>
                  <v-card-text v-html="report.note.htmlContent"></v-card-text>
                  <v-card-text>
                    <v-icon
                      v-if="report.note.rUserImageId == null"
                      size="60"
                      class="centeredimg"
                      >account_circle</v-icon
                    >
                    <v-img
                      v-if="report.note.rUserImageId != null"
                      max-width="60"
                      max-height="60"
                      class="centeredimg"
                      :src="`${appConfig.$api_url}/api/rimages/${report.note.rUserImageId}.jpg`"
                    ></v-img>
                    <br />
                    <small
                      >{{ report.note.userName }} (<router-link
                        :to="`/items/${report.note.relatedEntityFriendlyUrl}#${report.note.id}`"
                        v-html="report.note.dateTime"
                      ></router-link
                      >)</small
                    >
                  </v-card-text>
                </v-card>
              </v-flex>
            </v-layout>
            <v-spacer></v-spacer>
          </v-card-text>
        </v-card>
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
    </v-layout>
  </v-container>
</template>

<script>
import axios from "axios";
import axiosErrorHandler from "../utilities/axiosErrorHandler";

export default {
  name: "ReportedNotes",
  data() {
    return {
      userInfo: null,
      pageItems: [],
      pageSize: 50,
      pageNumber: 1,
      pageCount: 0,
      loading: true,
      errorMsg: "",
      noteType: "public",
    };
  },
  mounted() {
    if (localStorage.getItem("userInfo")) {
      try {
        this.userInfo = JSON.parse(localStorage.getItem("userInfo"));
        this.loadBookmarks();
      } catch (e) {
        this.userInfo = null;
      }
    }
  },
  methods: {
    loadBookmarks() {
      this.loading = true;
      this.errorMsg = "";
      if (this.$route.params.type != null) {
        this.noteType = this.$route.params.type;
      }
      this.pageNumber = 1;
      if (this.$route.params.pageno != null) {
        this.pageNumber = parseInt(this.$route.params.pageno);
      }
      document.title =
        "گنجینهٔ گنجور - یادداشتهای گزارش شده - صفحهٔ " + this.pageNumber;
      axios({
        method: "GET",
        url: this.appConfig.$api_url + "/api/artifacts/notes/reported",
        data: {},
        headers: {
          "content-type": "application/json",
          authorization: "bearer " + this.userInfo.token,
        },
      }).then(
        (response) => {
          this.pageItems = response.data;
          this.pageCount = JSON.parse(
            response.headers["paging-headers"]
          ).totalPages;
          this.loading = false;
        },
        (error) => {
          this.errorMsg = axiosErrorHandler.handle(error);
        }
      );
    },
    pageNumberChanged(pageNumber) {
      this.$router.push("/notes/pageno/" + pageNumber);
      this.loadBookmarks();
    },
  },
  watch: {
    //https://stackoverflow.com/a/41298520/66657
    $route() {
      this.loadBookmarks();
    },
  },
};
</script>

<style scoped>
.coverImage {
  margin: auto;
}

.clickable {
  cursor: pointer;
}
</style>