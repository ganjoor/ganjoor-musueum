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
                    <v-card-text v-for="note in pageItems" :key="note.id">
                        <router-link :to="`/items/${note.relatedEntityFriendlyUrl}`">
                            <v-img :src="`${appConfig.$api_url}/api/images/thumb/${note.relatedEntityImageId}.jpg`"
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
                                <v-card-text v-if="note.relatedItemParentName == null">
                                    {{note.relatedEntityName}}
                                </v-card-text>
                                <v-card-text v-if="note.relatedItemParentName != null">
                                    {{note.relatedEntityName}} ({{note.relatedItemParentName}})
                                </v-card-text>
                                <v-card-text v-html="note.htmlContent"></v-card-text>
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
    import axiosErrorHandler from '../utilities/axiosErrorHandler';

    export default {
        name: 'UserNotes',
        data() {
            return {
                userInfo: null,
                notes: [],
                pageItems: null,
                pageSize: 50,
                pageNumber: 1,
                pageCount: 0,
                loading: true,
                errorMsg: '',
                noteType: 'public',
            }
        },
        mounted() {            
            if (localStorage.getItem('userInfo')) {
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
                if (this.$route.params.type != null) {
                    this.noteType = this.$route.params.type;
                }
                if (this.noteType === 'public') {
                    document.title = 'گنجینهٔ گنجور - یادداشتهای عمومی من';
                }
                else {
                    document.title = 'گنجینهٔ گنجور - یادداشتهای شخصی من';
                }
                axios({
                    method: "GET", "url": this.appConfig.$api_url + "/api/artifacts/note/" + this.noteType, "data": {},
                    "headers":
                    {
                        "content-type": "application/json",
                        "authorization": "bearer " + this.userInfo.token
                    }
                }).then(result => {
                    this.notes = result.data;
                    this.pageNumber = 1;
                    if (this.$route.params.pageno != null) {
                        this.pageNumber = parseInt(this.$route.params.pageno);
                    }

                    var selectedItems = [];
                    for (var i = (this.pageNumber - 1) * this.pageSize; i < Math.min(this.pageNumber * this.pageSize, this.notes.length); i++) {
                        selectedItems.push(this.notes[i]);
                    }
                    this.pageCount = (this.notes.length % this.pageSize) == 0 ? parseInt(this.notes.length / this.pageSize, 10) : parseInt(this.notes.length / this.pageSize, 10) + 1;
                    this.pageItems = selectedItems;
                    this.loading = false;
                }, error => {
                    this.errorMsg = axiosErrorHandler.handle(error);
                });
            },
            pageNumberChanged(pageNumber) {
                var selectedItems = [];
                for (var i = (this.pageNumber - 1) * this.pageSize; i < Math.min(this.pageNumber * this.pageSize, this.notes.length); i++) {
                    selectedItems.push(this.notes[i]);
                }
                this.pageItems = selectedItems;

                this.$router.push('/mynotes/type/' + this.noteType + '/pageno/' + pageNumber);

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
    .coverImage {
        margin: auto
    }

    .clickable {
        cursor: pointer
    }
</style>