<template>
    <v-card>
        <v-toolbar dark color="primary">           
            <v-toolbar-title>بازبینی ارتباطات پیشنهادی با اشعار گنجور</v-toolbar-title>
            <div class="flex-grow-1"></div>
            <v-toolbar-items v-if="currentLink != null">
                <div v-if="currentLink != null">
                    <div>
                        <v-icon v-if="currentLink.suggestedBy.rImageId == null" size="42" class="centeredimg">account_circle</v-icon>
                        <v-img v-if="currentLink.suggestedBy.rImageId != null" max-width="42" max-height="42" class="centeredimg"
                               :src="`${appConfig.$api_url}/api/rimages/${currentLink.suggestedBy.rImageId}.jpg`"></v-img>
                    </div>
                    <div>
                        <small>{{currentLink.suggestedBy.firstName}} {{currentLink.suggestedBy.surName}}</small>
                    </div>                    
                </div>

                <v-btn v-if="!processing" dark color="green" @click="review(true)">تأیید<v-icon left>done</v-icon></v-btn>
                <v-btn v-if="!processing" dark color="red" @click="review(false)">رد<v-icon left>clear</v-icon></v-btn>
            </v-toolbar-items>
        </v-toolbar>        
        <v-layout v-if="currentLink != null" row wrap>
            <v-flex xs6>
                <iframe :src="`/ganjoor?url=${currentLink.ganjoorUrl}`" ref="ganjoorFrame" style="width:50vw;height:70vh"></iframe>
            </v-flex>
            <v-flex xs6>
                <iframe :src="`${currentLink.entityFriendlyUrl}`" style="width:50vw;height:70vh"></iframe>
            </v-flex>
        </v-layout>
        <v-flex xs12>
            <v-card>
                <v-card-text>
                    {{errorMsg}}
                </v-card-text>
            </v-card>
        </v-flex>
    </v-card>
</template>

<script>
    import axios from "axios";
    import axiosErrorHandler from './../utilities/axiosErrorHandler';
    export default {
        name: 'GanjoorLinks',
        data() {
            return {
                userInfo: null,
                links: [],
                currrentLinkIndex: -1,
                currentLink: null,
                errorMsg: '',
                processing: false,
            }
        },
        mounted() {
            document.title = 'بازبینی ارتباطات';
            if (localStorage.getItem('userInfo')) {
                try {
                    this.userInfo = JSON.parse(localStorage.getItem('userInfo'));
                } catch (e) {
                    this.userInfo = null;
                }
            }
             axios({
                    method: "GET", "url": this.appConfig.$api_url + "/api/artifacts/ganjoor?status=0&onlySynched=false", "data": {},
                    "headers":
                    {
                        "content-type": "application/json",
                        "authorization": "bearer " + this.userInfo.token
                    }
                }).then(result => {
                    this.links = result.data;
                    if (this.links.length > 0) {
                        this.currrentLinkIndex = 0;
                        this.currentLink = this.links[this.currrentLinkIndex];
                    }
                    else {
                        this.errorMsg = 'پیشنهادی برای بازبینی یافت نشد.';
                    }
                                       
            }, error => {
                this.errorMsg = axiosErrorHandler.handle(error);
            });
        },
        methods: {
            review(approve) {
                this.processing = true;
                var result = approve ? 1 : 2;
                axios({
                    method: "PUT", "url": this.appConfig.$api_url + "/api/artifacts/ganjoor/review/" + this.currentLink.id + "/" + result, "data": {},
                    "headers":
                    {
                        "content-type": "application/json",
                        "authorization": "bearer " + this.userInfo.token
                    }
                }).then(() => {
                    this.processing = false;
                    this.currrentLinkIndex++;
                    if (this.currrentLinkIndex < this.links.length) {
                        this.currentLink = this.links[this.currrentLinkIndex];
                    }
                    else {
                        this.processing = false;
                        this.currrentLinkIndex = -1;
                        this.currentLink = null;
                        this.errorMsg = 'پیشنهاد دیگری برای بازبینی یافت نشد.';
                    }
                
                                       
                }, error => {
                        this.processing = false;
                        this.errorMsg = axiosErrorHandler.handle(error);
            });
            },           
        }
    }
</script>

<style scoped>
    .centeredimg{
        margin:auto
    }
</style>