<template>
    <v-container grid-list-sm fluid>
        <v-layout row wrap align-center text-center fill-height>
            <v-flex v-if="errorMsg!=''" xs12>
                <v-card dark color="secondary">
                    <v-card-text>{{errorMsg}}</v-card-text>
                </v-card>
            </v-flex>
            <v-flex v-if="loading" xs12>
                <v-card dark color="secondary">
                    <v-progress-circular indeterminate></v-progress-circular>
                </v-card>
            </v-flex>
            <v-flex v-if="items.length > 0" xs12>
                <v-card dark color="secondary">
                    <v-card-text>نسخه‌های اضافه شدهٔ اخیر <small><router-link :to="`/items`" style="color:lawngreen">(فهرست کامل)</router-link></small></v-card-text>
                </v-card>
            </v-flex>
            <v-flex v-for="item in items"
                    :key="item.id"
                    d-flex>
                <v-card flat dark class="d-flex" style="width:200px" raised>
                    <router-link :to="`/items/${item.friendlyUrl}`">
                        <v-img :src="`${item.coverImage.externalNormalSizeImageUrl.replace('/norm/', '/thumb/').replace('/orig/', '/thumb/')}`"
                               width="200px"
                               class="grey lighten-2 clickable">
                            <template v-slot:placeholder>
                                <v-layout fill-height
                                          align-center
                                          justify-center
                                          ma-0>
                                    <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                                </v-layout>
                            </template>

                        </v-img>
                        <v-card-subtitle style="color:lightgray">
                            {{item.name}}
                        </v-card-subtitle>
                    </router-link>


                </v-card>
            </v-flex>
            <v-flex v-if="loadingAuthors" xs12>
                <v-card dark color="secondary">
                    <v-progress-circular indeterminate></v-progress-circular>
                </v-card>
            </v-flex>
            <v-flex v-if="authors.length > 0" xs12>
                <v-card dark color="secondary">
                    <v-card-text>مرور بر اساس پدیدآورنده <small><router-link :to="`/tags/contributor`" style="color:lawngreen">(فهرست کامل)</router-link></small></v-card-text>
                </v-card>
            </v-flex>
            <v-flex v-for="value in authors"
                    :key="value.friendlyUrl"
                    d-flex>

                <v-card flat dark class="d-flex" raised>

                    <router-link :to="`/tags/contributor/${value.friendlyUrl}`">
                        <v-img :src="`${value.externalNormalSizeImageUrl.replace('/norm/', '/thumb/').replace('/orig/', '/thumb/')}`"
                               width="200px"
                               class="grey lighten-2 clickable">
                            <template v-slot:placeholder>
                                <v-layout fill-height
                                          align-center
                                          justify-center
                                          ma-0>
                                    <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                                </v-layout>
                            </template>
                        </v-img>
                        <v-card-subtitle style="color:lightgray">
                            {{value.name}} ({{value.count}})
                        </v-card-subtitle>
                    </router-link>
                </v-card>
            </v-flex>
            <v-flex v-if="loadingBooks" xs12>
                <v-card dark color="secondary">
                    <v-progress-circular indeterminate></v-progress-circular>
                </v-card>
            </v-flex>
            <v-flex v-if="books.length > 0" xs12>
                <v-card dark color="secondary">
                    <v-card-text>مرور بر اساس نام کتاب <small><router-link :to="`/tags/book`" style="color:lawngreen">(فهرست کامل)</router-link></small></v-card-text>
                </v-card>
            </v-flex>
            <v-flex v-for="value in books"
                    :key="value.friendlyUrl"
                    d-flex>

                <v-card flat dark class="d-flex" raised>

                    <router-link :to="`/tags/book/${value.friendlyUrl}`">
                        <v-img :src="`${value.externalNormalSizeImageUrl.replace('/norm/', '/thumb/').replace('/orig/', '/thumb/')}`"
                               width="200px"
                               class="grey lighten-2 clickable">
                            <template v-slot:placeholder>
                                <v-layout fill-height
                                          align-center
                                          justify-center
                                          ma-0>
                                    <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                                </v-layout>
                            </template>
                        </v-img>
                        <v-card-subtitle style="color:lightgray">
                            {{value.name}} ({{value.count}})
                        </v-card-subtitle>
                    </router-link>
                </v-card>
            </v-flex>

        </v-layout>
    </v-container>
</template>
<script>
    import axios from "axios";
    import axiosErrorHandler from './../utilities/axiosErrorHandler';
    import { EventBus } from './../event-bus';

    export default {
        name: 'HomePage',
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
            if(localStorage.getItem('userInfo')) {
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
            userLoggedIn(userInfo){
                this.userInfo = userInfo;
                this.loadArtifacts();                
            },
            userLoggedOut(){
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
                        this.errorMsg = 'خطا در دریافت فهرست نسخه‌های اضافه شدهٔ اخیر - '  + axiosErrorHandler.handle(error);
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
                        this.errorMsg = 'خطا در دریافت فهرست پدیدآورندگان - '  + axiosErrorHandler.handle(error);
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
                        this.errorMsg = 'خطا در دریافت فهرست کتابها - '  + axiosErrorHandler.handle(error);
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
<style>
    .clickable{
        cursor:pointer
    }
</style>