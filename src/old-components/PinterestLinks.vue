<template>
    <v-card>
        <v-toolbar dark color="primary">
            <v-toolbar-title>بازبینی تصاویر مرتبط با اشعار گنجور</v-toolbar-title>
            <div class="flex-grow-1"></div>
            <v-toolbar-items v-if="currentLink != null">
                <v-btn v-if="!processing" dark color="green" @click="review(true)">تأیید<v-icon left>done</v-icon></v-btn>
                <v-btn v-if="!processing" dark color="red" @click="review(false)">رد<v-icon left>clear</v-icon></v-btn>
                <v-btn v-if="!processing" dark color="yellow" @click="next()">بعدی<v-icon left>skip_previous</v-icon></v-btn>
            </v-toolbar-items>
        </v-toolbar>
        <v-layout v-if="currentLink != null" row wrap>
            <v-flex xs6>
                <iframe :src="`/ganjoor?url=${currentLink.ganjoorUrl}`" ref="ganjoorFrame" style="width:50vw;height:70vh"></iframe>
            </v-flex>
            <v-flex xs6>
                <v-card>
                    <v-card-text>
                        <v-text-field label="توضیحات بررسی" v-model="reviewDesc"></v-text-field>
                    </v-card-text>
                    <v-card-text>
                        <p style="direction:ltr"><a :href="`${currentLink.pinterestUrl}`" target="_blank">{{currentLink.pinterestUrl}}</a></p>
                    </v-card-text>
                    <v-card-text>
                        <p ><a href="/utils" target="_blank">ابزارها</a></p>
                    </v-card-text>
                    <v-card-text>
                        <v-text-field label="نشانی تصویر" v-model="currentLink.pinterestImageUrl"></v-text-field>
                    </v-card-text>
                    <v-card-text>
                        <a :href="`${currentLink.pinterestImageUrl}`" target="_blank"><img :src="`${currentLink.pinterestImageUrl}`" width="600" /></a>
                    </v-card-text>
                    <v-card-text>
                        <v-textarea label="توضیحات" auto-grow rows="20" v-model="currentLink.altText"></v-textarea>
                    </v-card-text>
                </v-card>
                
              
                
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
        name: 'PinterestLinks',
        data() {
            return {
                userInfo: null,
                links: [],
                currrentLinkIndex: -1,
                currentLink: null,
                errorMsg: '',
                processing: false,
                reviewDesc: ''
            }
        },
        mounted() {
            document.title = 'بازبینی تصاویر';
            if (localStorage.getItem('userInfo')) {
                try {
                    this.userInfo = JSON.parse(localStorage.getItem('userInfo'));
                } catch (e) {
                    this.userInfo = null;
                }
            }
            axios({
                method: "GET", "url": this.appConfig.$api_url + "/api/artifacts/pinterest?status=0&onlySynched=false", "data": {},
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
                var uri = encodeURIComponent(this.currentLink.pinterestImageUrl);
                axios({
                    method: "PUT",
                    "url": this.appConfig.$api_url + "/api/artifacts/pinterest/review/" + this.currentLink.id + "/" + result + "?altText=" + this.currentLink.altText + "&reviewDesc=" + this.reviewDesc + "&imageUrl=" + uri,
                    "data": {},
                    "headers":
                    {
                        "content-type": "application/json",
                        "authorization": "bearer " + this.userInfo.token
                    }
                }).then(() => {
                    this.processing = false;
                    
                    this.next();

                }, error => {
                    this.processing = false;
                    this.errorMsg = axiosErrorHandler.handle(error);
                });
            },
            next() {
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
            },
        }
    }
</script>

<style scoped>
    .centeredimg {
        margin: auto
    }
</style>