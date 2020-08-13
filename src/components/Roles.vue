<template>
    <v-container grid-list-md text-center fill-height>
        <v-layout wrap>
            <v-flex v-if="roles == null" xs12>
                <v-card dark color="secondary">
                    <v-progress-circular indeterminate></v-progress-circular>
                </v-card>
            </v-flex>
            <v-flex v-if="errMsg != ''" xs12>
                <v-card>
                    <v-card-text>
                        {{errMsg}}
                    </v-card-text>
                </v-card>
            </v-flex>
            <v-flex v-if="roles != null" xs12>
                <v-data-table :headers="headers"
                              :items="roles"
                              :items-per-page="-1"
                              :expanded.sync="expanded"
                              :single-expand=true
                              item-key="name"
                              show-expand
                              :item-expanded="tableItemExpanded()"
                              class="elevation-1">
                    <template v-slot:top>
                        <v-toolbar flat color="white">
                            <v-toolbar-title>مدیریت نقشها</v-toolbar-title>
                            <div class="flex-grow-1"></div>
                            <v-btn v-if="!addclicked" class="mx-2" fab dark x-small color="indigo" @click="addclicked = true">
                                <v-icon dark>add</v-icon>
                            </v-btn>
                            <v-text-field v-if="addclicked" label="نام نقش جدید" v-model="newRoleName"></v-text-field>
                            <v-btn v-if="addclicked" class="mx-2" fab dark x-small color="indigo" @click="saveNewRoleClicked">
                                <v-icon dark>save</v-icon>
                            </v-btn>
                            <v-btn v-if="addclicked" class="mx-2" fab dark x-small @click="addclicked = false">
                                <v-icon dark>cancel</v-icon>
                            </v-btn>
                        </v-toolbar>
                    </template>
                    <template v-slot:expanded-item="{ headers }">
                        <td :colspan="headers.length">
                            <template>
                                <v-treeview v-model="selectedTreeNodes"
                                            selectable
                                            selected-color="red"
                                            :items="securableitems"
                                            :open-all=true>
                                </v-treeview>
                                <v-divider></v-divider>
                                <v-btn @click="onPermissionsSave(expanded[0].name)">ذخیره</v-btn>
                            </template>
                        </td>
                    </template>
                </v-data-table>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    import axios from "axios";
    import { EventBus } from './../event-bus';
    import axiosErrorHandler from './../utilities/axiosErrorHandler'

    export default {
        name: "Roles",
        data() {
            return {
                userInfo: null,
                errMsg: '',
                headers: [
                    { text: 'نام', value: 'name' },
                    { text: 'توضیحات', value: 'description' },
                ],
                roles: null,
                expanded: [],
                securableitems: [],
                selectedTreeNodes: [],
                addclicked: false,
                newRoleName: '',
            }
        },
        mounted() {
            document.title = 'گنجینهٔ گنجور - مدیریت نقشها';
            if (localStorage.getItem('userInfo')) {
                try {
                    this.userInfo = JSON.parse(localStorage.getItem('userInfo'));
                } catch (e) {
                    this.userInfo = null;
                }
            }

            EventBus.$on('user-logged-in', this.userLoggedIn);
            EventBus.$on('user-logged-out', this.userLoggedOut);

            axios({
                method: "GET", "url": this.appConfig.$api_url + "/api/roles/securableitems", "data": {},
                "headers":
                {
                    "content-type": "application/json"
                }
            }).then(result => {
                this.securableitems = [];
                for (var i = 0; i < result.data.length; i++) {
                    var treeNode = { "id": result.data[i].shortName, "name": result.data[i].description, "securableItemShortName": result.data[i].shortName, "operationShortName": result.data[i].shortName, children: [] };
                    for (var j = 0; j < result.data[i].operations.length; j++) {
                        treeNode.children.push({ "id": result.data[i].shortName + ':' + result.data[i].operations[j].shortName, "name": result.data[i].operations[j].description, "securableItemShortName": result.data[i].shortName, "operationShortName": result.data[i].operations[j].shortName});
                    }
                    this.securableitems.push(treeNode);
                }
            }, error => {
                this.errMsg = 'securableitems: ' + axiosErrorHandler.handle(error);
            });

            this.enumerateRoles();

        },
        methods: {
            enumerateRoles() {
            axios({
                method: "GET", "url": this.appConfig.$api_url + "/api/roles", "data": {},
                "headers":
                {
                    "authorization": "bearer " + this.userInfo.token,
                    "content-type": "application/json"
                }
            }).then(result => {
                this.roles = result.data;
            }, error => {
                this.errMsg = 'roles: ' + axiosErrorHandler.handle(error);
            });
            },
            userLoggedIn(userInfo) {
                this.userInfo = userInfo;
            },
            userLoggedOut() {
                this.userInfo = null;
            },
            tableItemExpanded() {
                this.selectedTreeNodes = [];
                if (this.expanded == null) {
                    return;
                }
                if (this.expanded.length == 0) {
                    return;
                }

                var local = [];
                if (this.expanded[0].permissions != null) {
                    for (var i = 0; i < this.expanded[0].permissions.length; i++) {
                        var id = this.expanded[0].permissions[i].securableItemShortName + ':' + this.expanded[0].permissions[i].operationShortName;
                        local.push(id);
                    }
                }

                this.selectedTreeNodes = local;
                
            },
            onPermissionsSave(roleName) {
                this.errMsg = '';

                var selected = [];
                for (var j = 0; j < this.securableitems.length; j++) {
                    var entity = { "shortName": this.securableitems[j].securableItemShortName, "description": null, "operations": [] };
                    for (var k = 0; k < this.securableitems[j].children.length; k++) {
                            for (var i = 0; i < this.selectedTreeNodes.length; i++) {
                                if (this.securableitems[j].children[k].id == this.selectedTreeNodes[i]) {
                                    entity.operations.push({ "shortName": this.securableitems[j].children[k].operationShortName, "description": null, "status": true });
                                }
                            }                            
                    }
                   
                    selected.push(entity);
                }

                axios({
                    method: "PUT", "url": this.appConfig.$api_url + "/api/roles/permissions/" + roleName, "data": selected,
                    "headers":
                    {
                        "authorization": "bearer " + this.userInfo.token,
                        "content-type": "application/json"
                    }
                }).then(() => {
                    this.errMsg = 'دسترسیهای نقش به درستی ذخیره شد.';
                }, error => {
                        this.errMsg = axiosErrorHandler.handle(error);
                });
                
            },
            saveNewRoleClicked() {
                this.errMsg = '';
                if (this.newRoleName === "") {
                    this.errMsg = 'نام نقش خالی است.';
                    return;
                }

                axios({
                    method: "POST", "url": this.appConfig.$api_url + "/api/roles", "data":
                    {
                        "name": this.newRoleName
                    },
                    "headers":
                    {
                        "authorization": "bearer " + this.userInfo.token,
                        "content-type": "application/json"
                    }
                }).then(() => {
                    this.enumerateRoles();
                    this.errMsg = 'نقش ایجاد شد.';
                    this.addclicked = false;
                }, error => {
                        this.errMsg = axiosErrorHandler.handle(error);
                });

            },

        }
    }
</script>

<style scoped>
</style>