<template>
    <v-container grid-list-md text-center>
        <v-layout wrap>
            <v-flex v-if="tag == null" xs12>
                <v-card dark color="secondary">
                    <v-progress-circular indeterminate></v-progress-circular>
                </v-card>
            </v-flex>

            <v-flex xs4>
                <v-card light v-if="tag != null">
                    <v-card-text>
                        {{tag.pluralName}} در گنجینهٔ گنجور
                    </v-card-text>
                    <v-card-text v-if="tag != null">
                        {{tag.values.length}} عنوان
                    </v-card-text>
                </v-card>
            </v-flex>
            <v-flex xs8>
                <v-card>
                    <v-container v-if="tag != null" grid-list-sm fluid>
                        <v-layout row wrap>
                            <v-flex v-for="value in tag.values"
                                    :key="value.friendlyUrl"
                                    d-flex>                             

                                <v-card flat dark raised class="d-flex">

                                    <router-link :to="`/tags/${tag.friendlyUrl}/${value.friendlyUrl}`">
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
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>

    import axios from "axios";

    export default {
        name: 'Tag',
        data() {
            return {
                tag: null,
                errorMsg: ''
            }
        },
        mounted() {
            axios({ method: "GET", "url": this.appConfig.$api_url + "/api/artifacts/tagbundle/" + this.$route.params.friendlyUrl , "data": {}, "headers": { "content-type": "application/json" } }).then(result => {
                this.tag = result.data;
                document.title = 'گنجینهٔ گنجور - ' + this.tag.pluralName;
            }, error => {
                this.errorMsg = error;
            });

        },
        methods: {

        },
    }
</script>

<style scoped>
</style>