<template>
  <v-app app id="app">
    <v-navigation-drawer v-model="drawer" app right>
      <v-list dense>
        <v-list-item>
          <v-list-item-action>
            <v-icon>home</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>
              <router-link to="/">گنجینهٔ گنجور</router-link>
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <UserSidebarWidget />
      </v-list>
    </v-navigation-drawer>

    <v-app-bar color="cyan" app dark fixed>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title id="logo">
        <router-link to="/" title="گنجینهٔ گنجور"
          ><v-icon>mdi-home</v-icon></router-link
        >
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-text-field
        hide-details
        append-icon="mdi-magnify"
        @click:append="searchIcon"
        @keydown.enter="searchIcon"
        v-model="searchText"
        single-line
      ></v-text-field>
    </v-app-bar>

    <v-container>
      <v-content>
        <router-view fluid fill-height></router-view>
      </v-content>
    </v-container>

    <v-footer color="cyan" app>
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <a href="https://blog.ganjoor.net/1399/01/29/pinterest/">
            <v-btn text color="white" v-on="on">
              <v-icon>post_add</v-icon>
            </v-btn>
          </a>
        </template>
        <span
          >نحوهٔ پیشنهاد اضافه شدن تصاویر جدید از اینستاگرام و سایر منابع</span
        >
      </v-tooltip>
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <a href="https://blog.ganjoor.net/1398/07/12/mganjoor/">
            <v-btn text color="white" v-on="on">
              <v-icon>language</v-icon>
            </v-btn>
          </a>
        </template>
        <span>نحوهٔ مشارکت در فهرست‌گذاری نسخه‌های خطی</span>
      </v-tooltip>
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <a href="https://blog.ganjoor.net/1398/07/11/ganjoor-museum/">
            <v-btn text color="white" v-on="on">
              <v-icon>help</v-icon>
            </v-btn>
          </a>
        </template>
        <span>مرور امکانات گنجینهٔ گنجور</span>
      </v-tooltip>
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <a href="https://blog.ganjoor.net/category/museum/">
            <v-btn text color="white" v-on="on">
              <v-icon>cast</v-icon>
            </v-btn>
          </a>
        </template>
        <span>تازه‌های گنجینهٔ گنجور</span>
      </v-tooltip>
      <v-spacer></v-spacer>
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <router-link to="/notes">
            <v-btn text color="white" v-on="on">
              یادداشتها<v-icon>notes</v-icon>
            </v-btn>
          </router-link>
        </template>
        <span>یادداشتهای عمومی همهٔ کاربران</span>
      </v-tooltip>
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <a href="https://ganjoor.net/contact/" target="_blank">
            <v-btn text icon color="white" v-on="on">
              <v-icon>email</v-icon>
            </v-btn>
          </a>
        </template>
        <span>تماس با ما</span>
      </v-tooltip>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  data: () => ({
    drawer: null,
  }),
  props: {
    source: String,
  },
};
</script>

<script>
import { EventBus } from "./event-bus";
import UserSidebarWidget from "./components/UserSidebarWidget.vue";

export default {
  name: "app",
  components: {
    UserSidebarWidget,
  },
  data() {
    return {
      userInfo: null,
      drawer: false,
      searchText: "",
    };
  },
  created() {
    document.title = "گنجینهٔ گنجور";
  },
  mounted() {
    if (localStorage.getItem("userInfo")) {
      try {
        this.userInfo = JSON.parse(localStorage.getItem("userInfo"));
      } catch (e) {
        this.userInfo = null;
      }
    }

    EventBus.$on("user-logged-in", this.userLoggedIn);
    EventBus.$on("user-logged-out", this.userLoggedOut);
    EventBus.$on("signing-up", this.signingUp);
  },
  methods: {
    userLoggedIn(userInfo) {
      this.userInfo = userInfo;
    },
    userLoggedOut() {
      this.userInfo = null;
    },
    signingUp() {
      this.drawer = false;
    },
    searchIcon() {
      if (this.$router.history.current.path != "/search") {
        this.$router.replace({
          path: "/search",
          query: { q: this.searchText },
        });
      } else {
        this.$router.replace({ query: { q: this.searchText } });
      }
    },
  },
};
</script>

<style>
* {
  direction: rtl;
  font-family: "Samim";
}

a {
  text-decoration: none;
}

#logo a,
.menu a {
  color: white;
}
</style>
