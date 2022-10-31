<template>
  <div class="container">
    <section class="flex items-stretch justify-center w-screen p-4">
      <div class="flex flex-col text-center w-full">
        <h1 class="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900">به گنجینهٔ گنجور خوش آمدید</h1>
      </div>
    </section>
    <div class="w-screen divide-y divide-y-reverse">
      <div class="flex justify-center w-screen">
        <span> نسخه‌های اضافه شدهٔ اخیر </span>
        <router-link :to="`/items`" class="rounded">
          <span
            class="inline-block py-1 px-2 rounded bg-indigo-50 text-indigo-500 text-xs font-medium tracking-widest mr-2">فهرست
            کامل</span>
        </router-link>
      </div>
      <section class="max-w-screen-xl mx-auto p-4">
        <div class="grid sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 gap-4 md:gap-6">
          <div v-for="item of items" :key="item.id">
            <Card :name="`${item.name}`" :url="`${item.friendlyUrl}`" :time="`${item.dateTime}`"
              :desc="`${item.description}`" :img="`${appConfig.$api_url}/api/images/thumb/${item.coverImage.id}.jpg`" />
          </div>
        </div>
      </section>
    </div>
    <div class="py-4 w-screen">
      <div class="flex justify-center w-screen">
        <span> مرور بر اساس پدیدآورنده </span>
        <router-link :to="`/items`" class="rounded">
          <span
            class="inline-block py-1 px-2 rounded bg-indigo-50 text-indigo-500 text-xs font-medium tracking-widest mr-2">فهرست
            کامل</span>
        </router-link>
      </div>
      <section class="max-w-screen-xl mx-auto p-4">
        <div class="grid sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 gap-4 md:gap-6">
          <div v-for="value in authors" :key="value.friendlyUrl">
            <Card :name="`${value.name} ${value.count}`" :url="`/tags/contributor/${value.friendlyUrl}`"
              :desc="`${value.name}`" :img="`${appConfig.$api_url}/api/images/thumb/${value.imageId}.jpg`" />
          </div>
        </div>
      </section>
    </div>
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
      loadingBooks: true,
      haveTime: true
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