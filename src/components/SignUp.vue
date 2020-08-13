<template>
    <div class="signup">
        <v-content class="pa-0">
            <v-flex v-if="errorMsg != ''" xs12>
                <v-card>
                    <v-card-text>
                        {{errorMsg}}
                    </v-card-text>
                </v-card>
            </v-flex>
            <v-layout justify-space-around v-if="userInfo === null && !verifying && !finalizing && !processing && !finalized" color="primary">
                <v-card>
                    <v-card-text>
                        <p>
                            لطفا پست الکترونیکی خود را جهت ثبت نام وارد کنید:
                        </p>
                    </v-card-text>
                    <v-card-text>
                        <v-text-field class="ltrinput" prepend-inner-icon="email" v-model="email" placeholder="پست الکترونیکی"></v-text-field>
                    </v-card-text>
                    <v-card-text>
                        <v-img v-if="captchaImageId!=''" :src="`${appConfig.$api_url}/api/rimages/${captchaImageId}.jpg`"
                               max-width="50px"
                               max-height="30px"
                               class="lighten-2">
                        </v-img>
                    </v-card-text>
                    <v-card-text>
                        <p>
                            عددی را که در تصویر امنیتی بالا می‌بینید در کادر زیر وارد کنید:
                        </p>
                        <v-text-field class="ltrinput" prepend-inner-icon="lock" v-model="captcha" placeholder="عدد تصویر امنیتی"></v-text-field>
                    </v-card-text>
                    <v-card-text>
                        <v-btn color="error" v-on:click="signup()">ادامه</v-btn>
                    </v-card-text>
                </v-card>
            </v-layout>
            <v-layout justify-space-around v-if="verifying && !processing" color="primary">
                <v-card>
                    <v-card-text v-if="secret==''">
                        <p>
                            لطفا پست الکترونیکی خود را چک کنید. در صورتی که نشانی پست الکترونیکی خود را درست وارد کرده باشید نامه‌ای از گنجینهٔ گنجور دریافت کرده‌اید که حاوی یک رمز است.
                        </p>

                        <p>
                            یا روی نشانی ارسال شده به پست الکترونیکی خود کلیک کنید یا رمز دریافتی را در کادر زیر وارد کرده روی دکمهٔ «ادامه» کلیک کنید.
                        </p>

                    </v-card-text>
                    <v-card-text>
                        <v-text-field class="ltrinput" prepend-inner-icon="lock" v-model="secret" placeholder="رمز دریافتی"></v-text-field>
                    </v-card-text>
                    <v-card-text>
                        <v-btn color="error" v-on:click="verify()">ادامه</v-btn>
                    </v-card-text>
                    <v-card-text v-if="secret==''">
                        <img src="../assets/images/signup-email1.png" />
                        <img src="../assets/images/signup-email2.png" />
                    </v-card-text>
                </v-card>
            </v-layout>
            <v-layout justify-space-around v-if="finalizing && !processing" color="primary">
                <v-card>
                    <v-card-text>
                        <p>
                            لطفا نام و نام خانوادگی و رمز مد نظر خود برای ورود را وارد کنید.
                        </p>
                    </v-card-text>
                    <v-card-text>
                        <v-text-field prepend-inner-icon="person" v-model="firstName" placeholder="نام"></v-text-field>
                    </v-card-text>
                    <v-card-text>
                        <v-text-field prepend-inner-icon="person" v-model="sureName" placeholder="نام خانوادگی"></v-text-field>
                    </v-card-text>
                    <v-card-text>
                        <p>گذرواژه باید شامل ۶ حرف باشد و از ترکیبی از اعداد و حروف انگلیسی تشکیل شده باشد.</p>
                        <p>حروف و اعداد نباید تکراری باشند و وجود حداقل یک عدد و یک حرف کوچک انگلیسی در گذرواژه الزامی است.</p>
                    </v-card-text>
                    <v-card-text>
                        <v-text-field prepend-inner-icon="lock" v-model="password" type="password" placeholder="گذرواژه دلخواه"></v-text-field>
                    </v-card-text>
                    <v-card-text>
                        <v-text-field prepend-inner-icon="lock" v-model="confirm" type="password" placeholder="تکرار گذرواژه"></v-text-field>
                    </v-card-text>
                    <v-card-text>
                        <v-btn color="error" v-on:click="finalize()">ادامه</v-btn>
                    </v-card-text>
                </v-card>
            </v-layout>
            <v-layout justify-space-around v-if="processing" color="primary">
                <v-progress-linear indeterminate></v-progress-linear>
            </v-layout>
            <v-layout justify-space-around v-if="finalized" color="primary">
                <v-card>
                    <router-link to="/">
                        <v-btn color="green" class="ma-2 white--text" @click="signin">
                            تبریک! ثبت نام تکمیل شد. برای ورود به سیستم کلیک کنید.        ‌<v-icon right dark>done</v-icon>
                        </v-btn>
                    </router-link>
                </v-card>
            </v-layout>
            <v-layout justify-space-around v-else-if="userInfo != null">
                <div>
                    <v-card>
                        <v-card-text>
                            شما پیش‌تر ثبت نام کرده‌اید!
                        </v-card-text>
                    </v-card>
                </div>
            </v-layout>
        </v-content>
    </div>
</template>

<script>
    import axios from "axios";
    import { EventBus } from '../event-bus';
    import axiosErrorHandler from './../utilities/axiosErrorHandler'


    export default {
        name: 'SignUp',
        data() {
            return {
                captchaImageId: '',
                email: '',
                captcha: '',
                secret: '',
                firstName: '',
                sureName: '',
                password: '',
                confirm: '',
                userInfo: null,
                errorMsg: '',
                verifying: false,
                processing: false,
                finalizing: false,
                finalized: false
            }
        },
        mounted() {

            document.title = 'گنجینهٔ گنجور - ثبت نام کاربر جدید';

            if (localStorage.getItem('userInfo')) {
                try {
                    this.userInfo = JSON.parse(localStorage.getItem('userInfo'));
                } catch (e) {
                    localStorage.removeItem('userInfo');
                }
            }
            else {
                if (this.$route.query.secret != null) {
                    this.verifying = true;
                    this.secret = this.$route.query.secret;
                }

                if (!this.verifying) {
                    if (this.$route.query.email != null) {
                        this.email = this.$route.query.email;
                    }
                    this.newcaptcha();
                }
            }





        },
        methods: {
            newcaptcha() {
                this.processing = true;
                axios({ method: "GET", "url": this.appConfig.$api_url + "/api/users/captchaimage", "data": {}, "headers": { "content-type": "application/json" } })
                    .then(result => {
                        this.captchaImageId = result.data;
                        this.processing = false;

                    }, error => {
                        this.processing = false;
                        this.errorMsg = axiosErrorHandler.handle(error);
                    });
            },
            signup() {
                this.processing = true;
                this.errorMsg = '';
                axios({
                    method: "POST", "url": this.appConfig.$api_url + "/api/users/signup", "data":
                    {
                        email: this.email,
                        clientAppName: 'Museum Clinet Web UI',
                        language: 'fa-IR',
                        captchaImageId: this.captchaImageId,
                        captchaValue: this.captcha
                    },
                    "headers":
                    {
                        "content-type": "application/json"
                    }
                }).then(() => {
                    this.processing = false;
                    this.verifying = true;
                }, error => {
                    this.newcaptcha()
                    this.processing = false;
                    this.errorMsg = axiosErrorHandler.handle(error);

                });
            },
            verify() {
                this.processing = true;
                this.errorMsg = '';
                axios({
                    method: "GET", "url": this.appConfig.$api_url + "/api/users/verify?type=0&secret=" + this.secret, "data": {},
                    "headers":
                    {
                        "content-type": "application/json"
                    }
                }).then((result) => {
                    this.processing = false;
                    this.verifying = false;
                    this.finalizing = true;
                    this.email = result.data;


                }, error => {
                    this.processing = false;
                    this.errorMsg = axiosErrorHandler.handle(error);

                });
            },
            finalize() {
                this.errorMsg = '';
                if (this.password != this.confirm) {
                    this.errorMsg = 'تکرار گذرواژه با گذرواژه وارد شده همخوانی ندارد.';
                    return;
                }

                this.processing = true;
                axios({
                    method: "POST", "url": this.appConfig.$api_url + "/api/users/finalizesignup", "data":
                    {
                        email: this.email,
                        secret: this.secret,
                        password: this.password,
                        firstName: this.firstName,
                        sureName: this.sureName
                    },
                    "headers":
                    {
                        "content-type": "application/json"
                    }
                }).then(() => {
                    this.processing = false;
                    this.finalizing = false;
                    this.finalized = true;

                }, error => {
                    this.processing = false;
                    this.errorMsg = axiosErrorHandler.handle(error);

                });
            },
            signin() {
                this.errorMsg = '';
                this.processing = true;
                axios({
                    method: "POST", "url": this.appConfig.$api_url + "/api/users/login",
                    "data": {
                        username: this.email,
                        password: this.password,
                        clientAppName: "Vue.js Client App",
                        language: "fa-IR"
                    }
                    , "headers": { "content-type": "application/json" }
                }).then(result => {
                    localStorage.setItem('userInfo', JSON.stringify(result.data));
                    this.userInfo = result.data;
                    EventBus.$emit('user-logged-in', this.userInfo);
                    this.processing = false;
                    this.$router.push('/');
                }, error => {
                    this.processing = false;
                    this.errorMsg = axiosErrorHandler.handle(error);

                });
            }
        }
    }
</script>

<style>
    .ltrinput input {
        direction: ltr
    }
</style>