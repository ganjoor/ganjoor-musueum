<template>
    <div v-if="this.userInfo != null"  class="container">
        <div class="large-12 medium-12 small-12 cell">
            <label>
                File
                <input type="file" id="file" ref="file" v-on:change="handleFileUpload()" />
            </label>
            <label>
                Result: {{uploadResult}}
            </label>
            <button v-on:click="submitFile()">Submit</button>
        </div>
    </div>
</template>

<script>
    import axios from "axios";
    import { EventBus } from '../event-bus';

    export default {
        name: 'UploadImage',
        data() {
            return {                
                input: {
                    username: "admin",
                    password: "Test!123",
                    clientAppName: "Museum Clinet Web UI",
                    language: "fa-IR"
                },
                userInfo: null,
                file: '',
                uploadResult: 'Not Started'
            }
        },   
        mounted() {
            if (localStorage.getItem('userInfo')) {
              try {
                  this.userInfo = JSON.parse(localStorage.getItem('userInfo'));
              } catch (e) {
                  this.userInfo = null;
              }
            }
            EventBus.$on('user-logged-in', this.userLoggedIn);
            EventBus.$on('user-logged-out', this.userLoggedOut);

        },
        methods: {
            userLoggedIn(userInfo){
                this.userInfo = userInfo;
            },
            userLoggedOut(){
                this.userInfo = null;
            },
            handleFileUpload(){
                this.file = this.$refs.file.files[0];
                this.uploadResult = 'Not Started';
            },
            submitFile() {
                this.uploadResult = 'Started';
                const data = new FormData();

                data.append('name', 'تست');
                data.append('description', '');
                data.append('srcUrl', '');
                data.append('picTitle', 'تست');
                data.append('picDescription', '');
                data.append('file', this.file);
                data.append('picSrcUrl', '');

                axios({
                    method: "POST", "url": this.appConfig.$api_url + "/api/artifacts", "data": data
                    ,
                    "headers":
                    {
                        "content-type": "multipart/form-data",
                        "authorization": "bearer " + this.userInfo.token
                    }
                }).then(result => {
                    this.uploadResult = 'Finished Successfully :' + result.data.coverImage.originalImageStoredFileName;
                    
                }, error => {
                        this.uploadResult = error;
                });
            },
        }
    }
</script>

<style scoped>
    h1, h2 {
        font-weight: normal;
    }

    ul {
        list-style-type: none;
        padding: 0;
    }

    li {
        display: inline-block;
        margin: 0 10px;
    }

    a {
        color: #42b983;
    }

    textarea {
        width: 600px;
        height: 200px;
    }
</style>