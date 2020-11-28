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
            <v-flex v-if="!loading && (notifications.length == 0)" xs12>
                <v-card dark color="secondary">
                    <v-card-text>اعلانی وجود ندارد.</v-card-text>
                </v-card>
            </v-flex>
            <v-flex xs12>
                <v-card v-for="notification in notifications" :key="notification.id">
                    <v-card-title @click="markAsRead(notification)">
                        <small>{{notification.subject}}</small>
                    </v-card-title>
                    <v-card-text v-html="notification.htmlText" @click="markAsRead(notification)"></v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="green" @click="switchReadStatus(notification)">{{getSwitchText(notification)}}<v-icon color="white" left>{{getSwitchIcon(notification)}}</v-icon></v-btn>
                        <v-btn color="red" @click="deleteNotification(notification, true)">حذف<v-icon color="white" left>delete</v-icon></v-btn>
                    </v-card-actions>
                </v-card>
            </v-flex>
            <v-flex v-if="notifications.length != 0" xs12>
                <v-card>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="green" @click="markAllRead()">همه را خواندم<v-icon color="white" left>done_all</v-icon></v-btn>
                        <v-btn color="red" @click="deleteAll()">حذف همهٔ خوانده شده‌ها<v-icon color="white" left>delete</v-icon></v-btn>
                    </v-card-actions>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    import axios from "axios";
    import axiosErrorHandler from './../utilities/axiosErrorHandler';
    import { EventBus } from '../event-bus';

    export default {
        name: 'Notifications',
        data() {
            return {
                userInfo: null,
                notifications: [],
                loading: true,
                errorMsg: ''
            }
        },
        mounted() {
            document.title = 'گنجینهٔ گنجور - اعلانهای من';
            if (localStorage.getItem('userInfo')) {
                try {
                    this.userInfo = JSON.parse(localStorage.getItem('userInfo'));
                    this.loadNotifications();
                } catch (e) {
                    this.userInfo = null;
                }
            }
        },
        methods: {
            loadNotifications() {
                this.loading = true;
                this.errorMsg = '';
                axios({
                    method: "GET", "url": this.appConfig.$api_url + "/api/notifications", "data": {},
                    "headers":
                    {
                        "content-type": "application/json",
                        "authorization": "bearer " + this.userInfo.token
                    }
                }).then(result => {
                    this.notifications = result.data;                    
                    this.loading = false;
                }, error => {
                    this.errorMsg = axiosErrorHandler.handle(error);
                });
            },
            getSwitchText(notification) {
                return notification.status == 0 ? 'خواندم' : '';
            },
            getSwitchIcon(notification) {
                return notification.status == 0 ? 'done' : 'undo';
            },
            switchReadStatus(notification) {
                this.loading = true;
                this.errorMsg = '';
                axios({
                    method: "PUT", "url": this.appConfig.$api_url + "/api/notifications/" + notification.id, "data": {},
                    "headers":
                    {
                        "content-type": "application/json",
                        "authorization": "bearer " + this.userInfo.token
                    }
                }).then(result => {
                    notification.status = result.data.status;                    
                    this.loading = false;
                    EventBus.$emit('user-logged-in', this.userInfo); //refresh unread notifications count
                }, error => {
                    this.errorMsg = axiosErrorHandler.handle(error);
                });
            },
            markAsRead(notification) {
                 if (notification.status == 0) {
                    this.switchReadStatus(notification);
                 }           
            },
            markAllRead() {
                  if (!confirm('آیا از علامت زدن همهٔ اعلانات به عنوان خوانده شده اطمینان دارید؟')) {
                    return;
                  } 
                  this.loading = true;
                this.errorMsg = '';
                axios({
                    method: "PUT", "url": this.appConfig.$api_url + "/api/notifications//api/notifications/allread" , "data": {},
                    "headers":
                    {
                        "content-type": "application/json",
                        "authorization": "bearer " + this.userInfo.token
                    }
                }).then(result => 
                {
                    this.loading = false;
                    if(result){
                       this.loadNotifications();
                    }
                    EventBus.$emit('user-logged-in', this.userInfo); //refresh unread notifications count
                }, error => {
                    this.errorMsg = axiosErrorHandler.handle(error);
                });     
            },
            deleteNotification(notification, ask) {
                if (ask) {
                    if (!confirm('آیا از حذف این اعلان اطمینان دارید؟')) {
                                        return;
                     }
                }
                
                this.loading = true;
                this.errorMsg = '';
                axios({
                    method: "DELETE", "url": this.appConfig.$api_url + "/api/notifications/" + notification.id, "data": {},
                    "headers":
                    {
                        "content-type": "application/json",
                        "authorization": "bearer " + this.userInfo.token
                    }
                }).then(() => {
                    this.notifications = this.notifications.filter(function (value) {
                                return value != notification;
                            });                   
                    this.loading = false;
                    EventBus.$emit('user-logged-in', this.userInfo); //refresh unread notifications count
                }, error => {
                    this.errorMsg = axiosErrorHandler.handle(error);
                });
            },
            deleteAll() {
                 if (!confirm('آیا از حذف همهٔ اعلانهای خوانده شده اطمینان دارید؟.')) {
                    return;
                }
                this.loading = true;
                this.errorMsg = '';
                axios({
                    method: "DELETE", "url": this.appConfig.$api_url + "/api/notifications/", "data": {},
                    "headers":
                    {
                        "content-type": "application/json",
                        "authorization": "bearer " + this.userInfo.token
                    }
                }).then(() => {
                    this.notifications = this.notifications.filter(function (value) {
                                return value.status != 0;
                            });          
                    this.loading = false;
                    EventBus.$emit('user-logged-in', this.userInfo); //refresh unread notifications count
                }, error => {
                    this.errorMsg = axiosErrorHandler.handle(error);
                });
            }
        }
        
    }
</script>

<style scoped>
   
</style>