<template>
    <v-container grid-list-md text-center>
        <v-layout wrap>
            <v-flex xs12 v-if="userInfo != null">

                
                <v-card>

                    <v-card-text>
                        <v-file-input accept="image/*" prepend-icon="mdi-camera" label="ارسال تصویر" v-model="files"></v-file-input>
                        <v-switch v-model="tempImageUpload"
                                    label="موقت"></v-switch>
                        <v-btn color="green" class="ma-2 white--text" @click="handleImageUpload">
                            ارسال        ‌<v-icon right dark>image</v-icon>
                        </v-btn>





                    </v-card-text>

                    <v-card-text v-if="rImageId != null">
                        <a :href="`${appConfig.$api_url}/api/rimages/${rImageId}.jpg`" target="_blank">{{appConfig.$api_url}}/api/rimages/{{rImageId}}.jpg</a>
                    </v-card-text>

                    <v-card-text v-if="rImageId != null">
                        <v-img 
                               :src="`${appConfig.$api_url}/api/rimages/${rImageId}.jpg`" class="centeredimg"></v-img>
                    </v-card-text>
                </v-card>
                <v-layout justify-space-around v-if="errorMsg!=''" color="primary">
                    <v-card color="red">
                        <v-card-text>
                            {{errorMsg}}
                        </v-card-text>
                    </v-card>
                </v-layout>
                
               
            </v-flex>

        </v-layout>
    </v-container>
</template>

<script>

    import axios from "axios";
    import axiosErrorHandler from './../utilities/axiosErrorHandler';

    export default {
        name: 'MixUtils',
        data() {
            return {
                userInfo: null,
                errorMsg: '',
                files: [],
                rImageId: null,
                tempImageUpload: true
               

            }
        },
        mounted() {
            document.title = 'ابزارها';
            if (localStorage.getItem('userInfo')) {
                try {
                    this.userInfo = JSON.parse(localStorage.getItem('userInfo'));
                } catch (e) {
                    this.userInfo = null;
                }
            }
        },
        methods: {
            handleImageUpload() {
                if (this.files.length == 0) {
                    this.errorMsg = 'لطفا تصویری را انتخاب کنید.';
                    return;
                }
                this._handleImageUpload();
            },
            _handleImageUpload() {
                this.errorMsg = '';
                const data = new FormData();

                data.append('path', this.tempImageUpload ? 'TempUploads' : 'PermUploads');
                data.append('file', this.files);

                axios({
                    method: "POST", "url": this.appConfig.$api_url + "/api/rimages", "data": data
                    ,
                    "headers":
                    {
                        "content-type": "multipart/form-data",
                        "authorization": "bearer " + this.userInfo.token
                    }
                }).then((result) => {
                    if (this.files.length == 0) {
                        this.rImageId = null;
                    }
                    else {
                        this.rImageId = result.data;
                    }

                }, error => {
                    this.errorMsg = axiosErrorHandler.handle(error);
                });
            },

            
        },
    }
</script>

<style scoped>
    .centeredimg {
        margin: auto
    }

    .ltrinput {
        direction: ltr
    }
</style>