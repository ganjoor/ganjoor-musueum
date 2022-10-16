<template>
  <div class="container">
    <section class="flex items-stretch justify-center w-screen p-10">
      <h2 class="text-2xl font-bold text-dark md:text-3xl">به گنجینهٔ گنجور خوش آمدید</h2>
    </section>
    <div>

    </div>
    <section class="flex items-stretch justify-center w-screen p-10">
      <div class="grid xl:grid-cols-5 md:grid-cols-3 grid-cols-1 gap-2 max-w-6xl place-items-stretch">
        <div v-for="item of items" :key="item.id">
          <Card :name="`${item.name}`" :url="`${item.friendlyUrl}`" :time="`${item.dateTime}`"
            :desc="`${item.description}`" :img="`${appConfig.$api_url}/api/images/thumb/${item.coverImage.id}.jpg`" />
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import axios from "axios";
import axiosErrorHandler from './../utilities/axiosErrorHandler';
import { EventBus } from './../event-bus';
import Card from '../components/Card.vue';

export default {
  name: 'HomePage',
  components: {
    Card
  },
  data() {
    return {
      userInfo: null,
      items: [],
      errorMsg: '',
      loading: true,
      authors: [],
      loadingAuthors: true,
      books: [],
      loadingBooks: true
    }
  },
  mounted() {
    document.title = 'گنجینهٔ گنجور';
    if (localStorage.getItem('userInfo')) {
      try {
        this.userInfo = JSON.parse(localStorage.getItem('userInfo'));
      } catch (e) {
        this.userInfo = null;
      }
    }

    EventBus.$on('user-logged-in', this.userLoggedIn);
    EventBus.$on('user-logged-out', this.userLoggedOut);

    this.loadArtifacts();
    this.loadAuthors();
    this.loadBooks();


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
      if (this.userInfo == null) {
        axios({ method: "GET", "url": this.appConfig.$api_url + "/api/artifacts?PageNumber=1&PageSize=5", "data": {}, "headers": { "content-type": "application/json" } }).then(result => {
          this.handleArtifactsResults(result);
        }, error => {
          this.handleArtifactsError(error);
        });
      }
      else {
        axios({
          method: "GET", "url": this.appConfig.$api_url + "/api/artifacts/secure?PageNumber=1&PageSize=5", "data": {},
          "headers":
          {
            "content-type": "application/json",
            "authorization": "bearer " + this.userInfo.token
          }
        }).then(result => {
          this.handleArtifactsResults(result);
        }, error => {
          this.errorMsg = 'خطا در دریافت فهرست نسخه‌های اضافه شدهٔ اخیر - ' + axiosErrorHandler.handle(error);
          this.loading = false;
        });
      }
    },
    handleArtifactsResults(result) {
      this.items = result.data;
      this.loading = false;
    },
    loadAuthors() {
      this.loadingAuthors = true;
      axios({
        method: "GET", "url": this.appConfig.$api_url + "/api/artifacts/tagbundle/contributor", "data": {},
        "headers":
        {
          "content-type": "application/json",
        }
      }).then(result => {
        this.handleAuthorsResults(result);
      }, error => {
        this.errorMsg = 'خطا در دریافت فهرست پدیدآورندگان - ' + axiosErrorHandler.handle(error);
        this.loadingAuthors = false;
      });
    },
    handleAuthorsResults(result) {
      this.authors = result.data.values.splice(0, 5);
      this.loadingAuthors = false;
    },
    loadBooks() {
      this.loadingBooks = true;
      axios({
        method: "GET", "url": this.appConfig.$api_url + "/api/artifacts/tagbundle/book", "data": {},
        "headers":
        {
          "content-type": "application/json",
        }
      }).then(result => {
        this.handleBooksResults(result);
      }, error => {
        this.errorMsg = 'خطا در دریافت فهرست کتابها - ' + axiosErrorHandler.handle(error);
        this.loadingBooks = false;
      });
    },
    handleBooksResults(result) {
      this.books = result.data.values.splice(0, 5);
      this.loadingBooks = false;
    },

  }
}
</script>