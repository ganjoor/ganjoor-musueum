<template>
  <div id="app">
    <Navbar v-bind:links="['Home', 'About']" />
    <router-view />
  </div>
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
import Navbar from './components/Navbar.vue';

export default {
  name: "app",
  components: {
    Navbar,
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
