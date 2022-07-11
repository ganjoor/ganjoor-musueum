<template>
  <div v-html="htmlSrc"></div>
</template>

<script>
import axios from "axios";
import axiosErrorHandler from "./../utilities/axiosErrorHandler";
import strReplacer from "./../utilities/strReplacer";
export default {
  name: "GanjoorFrame",
  data() {
    return {
      htmlSrc: "",
      errorMsg: "",
    };
  },
  mounted() {
    axios({
      method: "GET",
      url: this.$route.query.url,
      data: {},
      headers: { "content-type": "text/plain" },
    }).then(
      (result) => {
        var cssKept = strReplacer.replaceArray(
          result.data,
          ['/css/p8.css'],
          'p8css'
        );
        var replacedHtml = strReplacer.replaceArray(
          cssKept,
          ['href="/'],
          'href="/ganjoor?url=https://ganjoor.net/'
        );

        this.htmlSrc = strReplacer.replaceArray(
          replacedHtml,
          ['p8css'],
          'https://ganjoor.net/css/p8.css'
        );

        var searchString = "گنجور » ";
        var postIdIndex = this.htmlSrc.indexOf(searchString);
        if (postIdIndex != -1) {
          postIdIndex += searchString.length;
          var closingTitle = this.htmlSrc.indexOf("</title>", postIdIndex);
          if (closingTitle != -1) {
            var title = strReplacer.replaceAll(
              this.htmlSrc.substring(postIdIndex, closingTitle),
              "&raquo;",
              "»"
            );
            localStorage.setItem("ganjoorPostTitle", title);
          }
        }

        searchString = 'id="post-';
        postIdIndex = this.htmlSrc.indexOf(searchString, postIdIndex);
        if (postIdIndex != -1) {
          postIdIndex += searchString.length;
          var closingQuote = this.htmlSrc.indexOf('"', postIdIndex);
          if (closingQuote != -1) {
            var postId = this.htmlSrc.substring(postIdIndex, closingQuote);
            localStorage.setItem("ganjoorPostId", postId);
          }
        }
      },
      (error) => {
        this.errorMsg = axiosErrorHandler.handle(error);
      }
    );
  },
};
</script>

<style scoped>
</style>