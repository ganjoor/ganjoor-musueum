<template>
    <v-container grid-list-md text-center>
        <v-layout wrap>
            <v-flex xs12>
                <v-card v-if="loading" dark color="secondary">
                    <v-progress-circular indeterminate></v-progress-circular>
                </v-card>
            </v-flex>
            <v-flex v-if="errorMsg!=''" xs12>
                <v-card dark color="secondary">
                    <v-card-text>{{errorMsg}}</v-card-text>
                </v-card>
            </v-flex>
            <v-flex xs12>
                <v-card v-if="pageItems != null">
                    <v-card-text v-for="bookmark in pageItems" :key="bookmark.id">
                        <router-link v-if="bookmark.rArtifactMasterRecord != null" :to="`/items/${bookmark.rArtifactMasterRecord.friendlyUrl}`">
                            <v-img :src="`${appConfig.$api_url}/api/images/thumb/${bookmark.rArtifactMasterRecord.coverImage.id}.jpg`"
                                   max-width="200px"
                                   class="grey lighten-2 clickable coverImage">
                                <template v-slot:placeholder>
                                    <v-layout fill-height
                                              align-center
                                              justify-center
                                              ma-0>
                                        <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                                    </v-layout>
                                </template>
                            </v-img>
                            <v-card dark>
                                <v-card-text>
                                    {{bookmark.rArtifactMasterRecord.name}}
                                </v-card-text>
                            </v-card>
                        </router-link>
                        <router-link v-if="bookmark.rArtifactItemRecord != null" :to="`/items/${bookmark.rArtifactItemRecord.parentFriendlyUrl}/${bookmark.rArtifactItemRecord.item.friendlyUrl}`">
                            <v-img :src="`${appConfig.$api_url}/api/images/thumb/${bookmark.rArtifactItemRecord.item.images[0].id}.jpg`"
                                   max-width="200px"
                                   class="grey lighten-2 clickable coverImage">
                                <template v-slot:placeholder>
                                    <v-layout fill-height
                                              align-center
                                              justify-center
                                              ma-0>
                                        <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                                    </v-layout>
                                </template>
                            </v-img>
                            <v-card dark>
                                <v-card-text>
                                    {{bookmark.rArtifactItemRecord.item.name}} ({{bookmark.rArtifactItemRecord.parentName}})
                                </v-card-text>
                            </v-card>
                        </router-link>
                    </v-card-text>
                </v-card>
                <v-card>
                    <div class="text-center">
                        <v-pagination v-model="pageNumber"
                                      :length="pageCount"
                                      circle
                                      prev-icon="mdi-menu-right"
                                      next-icon="mdi-menu-left"
                                      @input="pageNumberChanged"></v-pagination>
                    </div>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    import axios from "axios";
    import axiosErrorHandler from './../utilities/axiosErrorHandler';

    export default {
        name: 'Bookmarks',
        data() {
            return {
                userInfo: null,
                bookmarks: [],
                pageItems: null,
                pageSize: 50,
                pageNumber: 1,
                pageCount: 0,
                loading: true,
                errorMsg: ''
            }
        },
        mounted() {
           document.title = 'گنجینهٔ گنجور - نشان شده‌های من';
           if(localStorage.getItem('userInfo')) {
                try {
                    this.userInfo = JSON.parse(localStorage.getItem('userInfo'));
                    this.loadBookmarks();
                } catch (e) {
                    this.userInfo = null;
                }
            }
        },
        methods: {
            loadBookmarks() {
                this.loading = true;
                this.errorMsg = '';
                axios({
                        method: "GET", "url": this.appConfig.$api_url + "/api/artifacts/bookmark", "data": {},
                        "headers":
                        {
                            "content-type": "application/json",
                             "authorization": "bearer " + this.userInfo.token
                        }
                }).then(result => {
                    this.bookmarks = result.data;
                    this.pageNumber = 1;
                    if (this.$route.params.pageno != null) {
                        this.pageNumber = parseInt(this.$route.params.pageno);
                    }

                    var selectedItems = [];
                    for (var i = (this.pageNumber - 1) * this.pageSize; i < Math.min(this.pageNumber * this.pageSize, this.bookmarks.length); i++) {
                        selectedItems.push(this.bookmarks[i]);
                    }
                    this.pageCount = (this.bookmarks.length % this.pageSize) == 0 ? parseInt(this.bookmarks.length / this.pageSize, 10) : parseInt(this.bookmarks.length / this.pageSize, 10) + 1;
                    this.pageItems = selectedItems;
                    this.loading = false;
                    }, error => {
                           this.errorMsg = axiosErrorHandler.handle(error);
                    });
            },
            pageNumberChanged(pageNumber) {
                var selectedItems = [];
                for (var i = (this.pageNumber - 1) * this.pageSize; i < Math.min(this.pageNumber * this.pageSize, this.bookmarks.length); i++) {
                    selectedItems.push(this.bookmarks[i]);
                }
                this.pageItems = selectedItems;

                this.$router.push('/bookmarks/pageno/' + pageNumber);               
                    
            },
        },
        watch: { //https://stackoverflow.com/a/41298520/66657
              $route() {
                 this.loadBookmarks();
            }         
        }
    }
</script>

<style scoped>
    .coverImage{
        margin:auto
    }
    .clickable{
        cursor:pointer
    }
</style>