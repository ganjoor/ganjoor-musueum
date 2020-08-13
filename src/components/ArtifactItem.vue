<template>
    <v-container grid-list-md text-center>
        <v-layout wrap>
            <v-flex v-if="longProcessOnGoing" xs12>
                <v-card dark color="secondary">
                    <v-progress-circular indeterminate></v-progress-circular>
                </v-card>
            </v-flex>

            <v-flex v-if="errorMsg!=''" xs12>
                <v-card>
                    <v-card-text>{{errorMsg}}</v-card-text>
                </v-card>
            </v-flex>

            <v-flex xs4>
                <v-card light v-if="item != null">
                    <v-card-text>
                        <router-link :to="`/items/${item.parentFriendlyUrl}`">
                            <v-img :src="`${appConfig.$api_url}/api/images/thumb/${item.parentImageId}.jpg`"
                                   :alt="`${item.parentName}`"
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
                        </router-link>
                    </v-card-text>
                    <v-card dark>
                        <v-card-text v-if="item != null">
                            تصویر {{item.item.order}} از {{item.parentItemCount}} <router-link :to="`/items/${item.parentFriendlyUrl}`">{{item.parentName}}</router-link>
                            <a :href="`${getViewerUrl()}`">
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on }">
                                        <v-chip outlined color="white" v-on="on" class="clickable"><v-icon dark>local_library</v-icon></v-chip>
                                    </template>
                                    <span>مشاهده در نمای کتابخوان</span>
                                </v-tooltip>
                            </a>
                            <v-tooltip v-if="userInfo != null" bottom>
                                <template v-slot:activator="{ on }">
                                    <v-btn text icon color="yellow" v-on="on" v-on:click="bookmark()">
                                        <v-icon>{{getbookmarkIcon()}}</v-icon>
                                    </v-btn>
                                </template>
                                <span>{{getbookmarkTooltip()}}</span>
                            </v-tooltip>
                            <v-tooltip v-if="userInfo != null" bottom>
                                <template v-slot:activator="{ on }">
                                    <v-btn text icon color="white" v-on="on" v-on:click="ganjoorLink = true">
                                        <v-icon>language</v-icon>
                                    </v-btn>
                                </template>
                                <span>پیشنهاد شعر مرتبط در گنجور</span>
                            </v-tooltip>
                            <v-tooltip v-if="checkPermission('artifact', 'modify')" bottom>
                                <template v-slot:activator="{ on }">
                                    <v-btn text icon color="white" v-on="on" v-on:click="cover()">
                                        <v-icon>image</v-icon>
                                    </v-btn>
                                </template>
                                <span>تصویر جلد کتاب شود</span>
                            </v-tooltip>
                        </v-card-text>
                    </v-card>
                </v-card>
                <v-layout wrap v-if="item != null">
                    <v-flex xs6>
                        <v-card v-if="item.previousItemFriendlyUrl != ''">
                            <v-card-text>
                                <router-link :to="`/items/${item.parentFriendlyUrl}/${item.previousItemFriendlyUrl}`">
                                    <v-img :src="`${appConfig.$api_url}/api/images/thumb/${item.prevItemImageId}.jpg`"
                                           alt="قبلی"
                                           max-width="100px"
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
                                </router-link>
                                <router-link :to="`/items/${item.parentFriendlyUrl}/${item.previousItemFriendlyUrl}`">
                                    قبلی
                                </router-link>

                            </v-card-text>                            
                        </v-card>                        
                    </v-flex>
                    <v-flex xs6>
                        <v-card v-if="item.nextItemFriendlyUrl != ''">
                            <v-card-text>
                                <router-link :to="`/items/${item.parentFriendlyUrl}/${item.nextItemFriendlyUrl}`">
                                    <v-img :src="`${appConfig.$api_url}/api/images/thumb/${item.nextItemImageId}.jpg`"
                                           alt="بعدی"
                                           max-width="100px"
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
                                </router-link>
                                <router-link :to="`/items/${item.parentFriendlyUrl}/${item.nextItemFriendlyUrl}`">
                                    بعدی
                                </router-link>

                            </v-card-text>
                        </v-card>
                    </v-flex>
                    <v-flex xs12>
                        <v-card>
                            <v-card-text>
                                <router-link  :to="`/items/${item.parentFriendlyUrl}/pageno/${Math.floor(((item.item.order - 1) / 21)) + 1}`">
                                    صفحهٔ {{Math.floor(((item.item.order - 1) / 21)) + 1}}
                                </router-link>
                            </v-card-text>
                        </v-card>
                    </v-flex>
                </v-layout>
            </v-flex>
            <v-flex xs8>
                <div v-if="item != null">
                    <v-tabs v-model="active_tab">
                        <v-tab :href="`#tab-1`">
                            تصویر
                        </v-tab>
                        <v-tab :href="`#tab-2`">
                            ویژگیها
                        </v-tab>
                        <v-tab v-if="userInfo != null" :href="`#tab-3`">
                            یادداشتهای شخصی
                        </v-tab>
                        <v-tab :href="`#tab-4`">
                            یادداشتهای عمومی
                        </v-tab>
                    </v-tabs>
                    <v-tabs-items v-model="active_tab">
                        <v-tab-item :value="`tab-1`">
                            <v-flex xs12 >
                                <v-card dark color="secondary">
                                    <router-link :to="`/items/${item.parentFriendlyUrl}/${item.previousItemFriendlyUrl}`" v-if="item.previousItemFriendlyUrl != ''">
                                        <v-tooltip bottom>
                                            <template v-slot:activator="{ on }">
                                                <v-btn text icon color="white" v-on="on">
                                                    <v-icon>navigate_next</v-icon>
                                                </v-btn>
                                            </template>
                                            <span>قبلی</span>
                                        </v-tooltip>
                                    </router-link>
                                    <router-link :to="`/items/${item.parentFriendlyUrl}/${item.nextItemFriendlyUrl}`" v-if="item.nextItemFriendlyUrl != ''">
                                        <v-tooltip bottom>
                                            <template v-slot:activator="{ on }">
                                                <v-btn text icon color="white" v-on="on">
                                                    <v-icon>navigate_before</v-icon>
                                                </v-btn>
                                            </template>
                                            <span>بعدی</span>
                                        </v-tooltip>
                                    </router-link>
                                    <a :href="`${getViewerUrl()}`">
                                        <v-tooltip bottom>
                                            <template v-slot:activator="{ on }">
                                                <v-chip outlined color="white" v-on="on" class="clickable"><v-icon dark>local_library</v-icon></v-chip>
                                            </template>
                                            <span>مشاهده در نمای کتابخوان</span>
                                        </v-tooltip>
                                    </a>
                                    <v-tooltip v-if="userInfo != null" bottom>
                                        <template v-slot:activator="{ on }">
                                            <v-btn text icon color="yellow" v-on="on" v-on:click="bookmark()">
                                                <v-icon>{{getbookmarkIcon()}}</v-icon>
                                            </v-btn>
                                        </template>
                                        <span>{{getbookmarkTooltip()}}</span>
                                    </v-tooltip>
                                    <v-tooltip v-if="userInfo != null" bottom>
                                        <template v-slot:activator="{ on }">
                                            <v-btn text icon color="white" v-on="on" v-on:click="ganjoorLink = true">
                                                <v-icon>language</v-icon>
                                            </v-btn>
                                        </template>
                                        <span>پیشنهاد شعر مرتبط در گنجور</span>
                                    </v-tooltip>
                                    <a :href="`${appConfig.$api_url}/api/images/orig/${item.item.images[0].id}.jpg`" target="_blank">
                                        <v-tooltip bottom>
                                            <template v-slot:activator="{ on }">
                                                <v-btn text icon color="white" v-on="on">
                                                    <v-icon>zoom_in</v-icon>
                                                </v-btn>
                                            </template>
                                            <span>بزرگترین اندازه</span>
                                        </v-tooltip>
                                    </a>
                                    <v-tooltip bottom>
                                        <template v-slot:activator="{ on }">
                                            <v-btn text icon color="white" v-on="on" v-on:click="rotate(90)">
                                                <v-icon>rotate_right</v-icon>
                                            </v-btn>
                                        </template>
                                        <span>چرخش به راست</span>
                                    </v-tooltip>
                                    <v-tooltip bottom>
                                        <template v-slot:activator="{ on }">
                                            <v-btn text icon color="white" v-on="on" v-on:click="rotate(270)">
                                                <v-icon>rotate_left</v-icon>
                                            </v-btn>
                                        </template>
                                        <span>چرخش به چپ</span>
                                    </v-tooltip>
                                    <v-tooltip bottom v-if="imageAngle != 0 && checkPermission('artifact', 'modify')">
                                        <template v-slot:activator="{ on }">
                                            <v-btn text icon color="white" v-on="on" v-on:click="saveRotation()">
                                                <v-icon>save</v-icon>
                                            </v-btn>
                                        </template>
                                        <span>ذخیرهٔ چرخش</span>
                                    </v-tooltip>
                                    <v-tooltip bottom>
                                        <template v-slot:activator="{ on }">
                                            <v-btn text icon color="white" v-on="on" v-on:click="rotate(0)">
                                                <v-icon>undo</v-icon>
                                            </v-btn>
                                        </template>
                                        <span>برگشت به وضعیت پیش‌فرض تصویر</span>
                                    </v-tooltip>
                                    <v-tooltip bottom v-if="checkPermission('artifact', 'modify')">
                                        <template v-slot:activator="{ on }">
                                            <v-btn text icon color="white" v-on="on" v-on:click="tagHasImage()">
                                                <v-icon>image</v-icon>
                                            </v-btn>
                                        </template>
                                        <span>دارای نقاشی </span>
                                    </v-tooltip>
                                </v-card>                               
                            </v-flex>
                            <a :href="`${appConfig.$api_url}/api/images/orig/${item.item.images[0].id}.jpg`" target="_blank">
                                <v-img v-if="imageAngle == 0" :src="`${appConfig.$api_url}/api/images/norm/${item.item.images[0].id}.jpg`"
                                       :alt="`${item.item.name}`"
                                       class="grey lighten-2 clickable coverImage">
                                </v-img>
                                <img :src="`${appConfig.$api_url}/api/images/norm/${item.item.images[0].id}.jpg`"
                                     :alt="`${item.item.name}`"
                                     id="image" ref="image" />
                            </a>                          
                        </v-tab-item>
                        <v-tab-item :value="`tab-2`">
                            <v-card v-if="item != null">
                                <v-card-text>
                                    <v-img :src="`${appConfig.$api_url}/api/images/thumb/${item.item.images[0].id}.jpg`"
                                           :alt="`${item.item.name}`"
                                           max-width="200px"
                                           class="grey lighten-2 coverImage">
                                        <template v-slot:placeholder>
                                            <v-layout fill-height
                                                      align-center
                                                      justify-center
                                                      ma-0>
                                                <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                                            </v-layout>
                                        </template>
                                    </v-img>
                                </v-card-text>

                            </v-card>
                            <v-card v-if="checkPermission('tag', 'modify') && item.formattedTags.length == 0">
                                <v-card-text>
                                    <v-btn text icon v-on:click="addTag(null)">
                                        <v-icon>add</v-icon>
                                    </v-btn>
                                </v-card-text>
                            </v-card>
                            <v-simple-table>
                                <tbody>
                                    <tr v-for="tag in item.formattedTags" :key="tag.id">
                                        <td v-if="tag.friendlyUrl != null && (tag.tagType == 2 || tag.tagType == 3 || tag.tagType == 5)">
                                            <router-link :to="getTagLink(tag)">
                                                {{tag.name}}
                                            </router-link>
                                        </td>
                                        <td v-if="tag.friendlyUrl == null || (tag.tagType != 2 && tag.tagType != 3 && tag.tagType != 5)">
                                            {{tag.name}}
                                        </td>
                                        <td v-if="checkPermission('tag', 'modify')">
                                            <v-btn text icon v-on:click="editTag(tag)">
                                                <v-icon>edit</v-icon>
                                            </v-btn>
                                            <v-btn text icon v-on:click="addTag(tag)">
                                                <v-icon>add</v-icon>
                                            </v-btn>
                                            <v-btn text icon v-on:click="moveTag(tag, 'up')">
                                                <v-icon>arrow_drop_up</v-icon>
                                            </v-btn>
                                            <v-btn text icon v-on:click="moveTag(tag, 'down')">
                                                <v-icon>arrow_drop_down</v-icon>
                                            </v-btn>
                                        </td>
                                        <td>
                                            <v-simple-table>
                                <tbody>
                                    <tr v-for="value in tag.values" :key="value.id">
                                        <td v-if="value.friendlyUrl != null && (tag.tagType == 2 || tag.tagType == 3)">
                                            <router-link :to="getTagValueLink(value, tag)">
                                                {{value.value}}
                                            </router-link>
                                        </td>
                                        <td v-if="value.friendlyUrl == null && (tag.tagType == 2 || tag.tagType == 3)">
                                                {{value.value}}
                                        </td>
                                        <td v-if="tag.tagType != 2 && tag.tagType != 3 && tag.tagType != 4" v-html="value.value"></td>
                                        <td v-if="tag.tagType == 4" class="ltrvalue" v-html="value.value"></td>

                                        <td v-if="tag.tagType == 1 || tag.tagType == 3" class="btnedttagvalue">
                                            <a :href="value.valueSupplement" target="_blank">
                                                <v-btn text icon color="primary">
                                                    <v-icon>open_in_new</v-icon>
                                                </v-btn>
                                            </a>
                                        </td>
                                        <td v-if="checkPermission('artifact', 'edittag')" class="btnedttagvalue">
                                            <v-btn text icon v-on:click="editTagValue(value, tag)">
                                                <v-icon>edit</v-icon>
                                            </v-btn>
                                            <v-btn text icon v-on:click="removeTagValue(value)">
                                                <v-icon>delete</v-icon>
                                            </v-btn>
                                            <v-btn text icon v-on:click="moveValue(value, 'up')">
                                                <v-icon>arrow_drop_up</v-icon>
                                            </v-btn>
                                            <v-btn text icon v-on:click="moveValue(value, 'down')">
                                                <v-icon>arrow_drop_down</v-icon>
                                            </v-btn>
                                        </td>
                                    </tr>
                                </tbody>
                            </v-simple-table>
                            </td>
                            </tr>
                            </tbody>
                            </v-simple-table>

                            <!-- add tag begin -->
                            <v-layout justify-center v-if="checkPermission('tag', 'modify')">
                                <v-dialog v-model="addingTagType"
                                          width="500">
                                    <v-card>

                                        <v-card-text>
                                            <v-checkbox v-model="addPredefinedTag"
                                                        label="ویژگی از پیش تعریف شده">
                                            </v-checkbox>
                                        </v-card-text>

                                        <v-card-text v-if="!addPredefinedTag">
                                            <v-text-field label="نام انگلیسی ویژگی" v-model="tagName"></v-text-field>
                                        </v-card-text>

                                        <v-card-text v-if="addPredefinedTag">
                                            <v-select v-model="newTag"
                                                      :items="tagsArray"
                                                      label="نام ویژگی"
                                                      hint="نام ویژگی"
                                                      item-text="name"
                                                      item-value="id"
                                                      persistent-hint
                                                      return-object
                                                      single-line></v-select>
                                        </v-card-text>

                                        <v-progress-linear v-if="longProcessInDialogs" indeterminate></v-progress-linear>
                                        <v-divider></v-divider>

                                        <v-card-actions>
                                            <v-spacer></v-spacer>
                                            <v-btn color="primary" @click="onAddTagOKClicked()">تأیید</v-btn>
                                            <v-btn color="secondary" text @click="addingTagType = false">انصراف</v-btn>
                                        </v-card-actions>

                                    </v-card>
                                </v-dialog>
                            </v-layout>
                            <!-- add tag end -->
                            <!-- edit tag name begin -->
                            <v-layout justify-center v-if="checkPermission('tag', 'modify')">
                                <v-dialog v-model="editingTagType"
                                          width="500">
                                    <v-card>
                                        <v-card-text>
                                            <v-text-field label="نام ویژگی" v-model="tagName"></v-text-field>
                                        </v-card-text>

                                        <v-card-text>
                                            <v-text-field label="اسم جمع" v-model="tagPlural"></v-text-field>
                                        </v-card-text>

                                        <v-card-text>
                                            <v-select v-model="tagType"
                                                      :items="tagTypeArray"
                                                      label="نوع"
                                                      hint="نوع"
                                                      persistent-hint
                                                      return-object
                                                      single-line></v-select>
                                        </v-card-text>

                                        <v-card-text>
                                            <v-text-field label="نشانی جستجو" v-model="tagUrl"></v-text-field>
                                        </v-card-text>

                                        <v-card-text>
                                            <v-checkbox label="معمولا همه مقادیر یکسان فارغ از نوع تغییر می‌کند" v-model="tagValueEditGlobally"></v-checkbox>
                                        </v-card-text>

                                        <v-progress-linear v-if="longProcessInDialogs" indeterminate></v-progress-linear>
                                        <v-divider></v-divider>

                                        <v-card-actions>
                                            <v-spacer></v-spacer>
                                            <v-btn color="primary" @click="onEditTagOKClicked()">تأیید</v-btn>
                                            <v-btn color="secondary" text @click="editingTagType = false">انصراف</v-btn>
                                        </v-card-actions>

                                    </v-card>
                                </v-dialog>
                            </v-layout>
                            <!-- edit tag name end -->
                            <!-- edit tag value begin -->
                            <v-layout justify-center v-if="checkPermission('artifact', 'edittag')">
                                <v-dialog v-model="editingTagValue"
                                          width="500">
                                    <v-card>
                                        <v-card-text>
                                            <v-textarea label="ویژگی" auto-grow rows="10" v-model="tagValue"></v-textarea>
                                        </v-card-text>

                                        <v-card-text>
                                            <v-text-field label="نشانی جستجو" v-model="tagValueUrl"></v-text-field>
                                        </v-card-text>

                                        <v-card-text>
                                            <v-text-field label="پیوند / سطح عنوان" v-model="tagValueLink"></v-text-field>
                                        </v-card-text>

                                        <v-card-text>
                                            <v-checkbox label="همه مقادیر یکسان تغییر کنند" v-model="tagValueEditGlobally"></v-checkbox>
                                        </v-card-text>

                                        <v-progress-linear v-if="longProcessInDialogs" indeterminate></v-progress-linear>
                                        <v-divider></v-divider>

                                        <v-card-actions>
                                            <v-spacer></v-spacer>
                                            <v-btn color="primary" @click="onEditTagValueOKClicked()">تأیید</v-btn>
                                            <v-btn color="secondary" text @click="editingTagValue = false">انصراف</v-btn>
                                        </v-card-actions>

                                    </v-card>
                                </v-dialog>
                            </v-layout>
                            <!-- edit tag value end -->

                        </v-tab-item>
                        <v-tab-item v-if="userInfo != null" :value="`tab-3`">
                            <v-flex v-if="loadingPrivateNotes" xs12>
                                <v-card dark color="secondary">
                                    <v-progress-circular indeterminate></v-progress-circular>
                                </v-card>
                            </v-flex>
                            <v-card v-if="item != null">
                                <v-card-text>
                                    <v-img :src="`${appConfig.$api_url}/api/images/thumb/${item.item.images[0].id}.jpg`"
                                           :alt="`${item.item.name}`"
                                           max-width="200px"
                                           class="grey lighten-2 coverImage">
                                        <template v-slot:placeholder>
                                            <v-layout fill-height
                                                      align-center
                                                      justify-center
                                                      ma-0>
                                                <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                                            </v-layout>
                                        </template>
                                    </v-img>
                                </v-card-text>
                            </v-card>
                            <v-card v-for="note in mynotes" :key="note.id">
                                <v-card-text v-html="note.htmlContent"></v-card-text>
                                <v-card-actions>
                                    <small v-html="note.dateTime"></small>
                                    <v-spacer></v-spacer>
                                    <v-tooltip bottom>
                                        <template v-slot:activator="{ on }">
                                            <v-btn text icon color="blue" v-on="on" v-on:click="editCurrentNote(note, 'private')">
                                                <v-icon>edit</v-icon>
                                            </v-btn>
                                        </template>
                                        <span>اصلاح</span>
                                    </v-tooltip>
                                    <!-- edit note begin -->
                                    <v-layout justify-center v-if="editingPrivateNote">
                                        <v-dialog v-model="editingPrivateNote"
                                                  width="500">
                                            <v-card>
                                                <v-textarea v-model="newNote"
                                                            auto-grow
                                                            outlined
                                                            rounded></v-textarea>

                                                <v-progress-linear v-if="longProcessInDialogs" indeterminate></v-progress-linear>
                                                <v-divider></v-divider>

                                                <v-card-actions>
                                                    <v-spacer></v-spacer>
                                                    <v-btn color="primary" @click="onEditNoteOKClicked()">تأیید</v-btn>
                                                    <v-btn color="secondary" text @click="editingPrivateNote = false">انصراف</v-btn>
                                                </v-card-actions>

                                            </v-card>
                                        </v-dialog>
                                    </v-layout>
                                    <!-- edit note end -->
                                    <v-tooltip bottom>
                                        <template v-slot:activator="{ on }">
                                            <v-btn text icon color="red" v-on="on" v-on:click="deleteNote(note)">
                                                <v-icon>delete</v-icon>
                                            </v-btn>
                                        </template>
                                        <span>حذف</span>
                                    </v-tooltip>
                                </v-card-actions>
                            </v-card>
                            <v-card dark>
                                <v-card-text v-if="!writingPrivateNote">
                                    <v-btn text v-on:click="writingPrivateNote = true">
                                        یادداشت جدید <v-icon>add</v-icon>
                                    </v-btn>
                                </v-card-text>
                                <v-card-text v-if="writingPrivateNote">
                                    <v-textarea v-model="newNote"
                                                auto-grow
                                                outlined
                                                rounded></v-textarea>                                   
                                    <v-btn text v-on:click="insertCroppedImage = true">
                                        درج برش <v-icon>crop</v-icon>
                                    </v-btn>
                                    <v-btn text v-on:click="saveNewNote('private')">
                                        ذخیره <v-icon>save</v-icon>
                                    </v-btn>
                                    <v-btn text v-on:click="writingPrivateNote = false">
                                        انصراف <v-icon>cancel</v-icon>
                                    </v-btn>
                                    <!-- insert cropped image begin -->
                                    <v-layout justify-center v-if="insertCroppedImage">
                                        <v-dialog v-model="insertCroppedImage"
                                                  width="500">
                                            <v-card>
                                                <cropper classname="cropper"
                                                         :src="`${appConfig.$api_url}/api/images/thumb/${item.item.images[0].id}.jpg`"
                                                         :stencil-props="{aspectRatio: 10/12}"
                                                         @change="cropperCoordinatesChanged"
                                                         ></cropper>
                                                <v-progress-linear v-if="longProcessInDialogs" indeterminate></v-progress-linear>
                                                <v-divider></v-divider>

                                                <v-card-actions>
                                                    <v-spacer></v-spacer>
                                                    <v-btn color="primary" @click="onCropOKClicked()">تأیید</v-btn>
                                                    <v-btn color="secondary" text @click="insertCroppedImage = false">انصراف</v-btn>
                                                </v-card-actions>

                                            </v-card>
                                        </v-dialog>
                                    </v-layout>
                                    <!-- insert cropped image end -->
                                </v-card-text>
                            </v-card>

                        </v-tab-item>
                        <v-tab-item :value="`tab-4`">
                            <v-flex v-if="loadingPublicNotes" xs12>
                                <v-card dark color="secondary">
                                    <v-progress-circular indeterminate></v-progress-circular>
                                </v-card>
                            </v-flex>
                            <v-card v-if="item != null">
                                <v-card-text>
                                    <v-img :src="`${appConfig.$api_url}/api/images/thumb/${item.item.images[0].id}.jpg`"
                                           :alt="`${item.item.name}`"
                                           max-width="200px"
                                           class="grey lighten-2 coverImage">
                                        <template v-slot:placeholder>
                                            <v-layout fill-height
                                                      align-center
                                                      justify-center
                                                      ma-0>
                                                <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                                            </v-layout>
                                        </template>
                                    </v-img>
                                </v-card-text>
                            </v-card>
                            <NotesThread v-if="publicnotes != null" :entity="`artifactitem`" :notes="publicnotes" :hashNoteId="hashNoteId" :itemId="item.item.id" :level="0" :imageId="item.item.images[0].id" />
                        </v-tab-item>
                    </v-tabs-items>
                </div>
            </v-flex>
        </v-layout>
        <v-dialog v-model="ganjoorLink" fullscreen hide-overlay transition="dialog-bottom-transition">           
            <v-card>
                <v-toolbar dark color="primary">
                    <v-btn icon dark @click="ganjoorLink = false">
                        <v-icon color="red">mdi-close</v-icon>
                    </v-btn>
                    <v-toolbar-title>پیشنهاد شعر مرتبط در گنجور</v-toolbar-title>
                    <div class="flex-grow-1"></div>
                    <v-toolbar-items>
                        <v-btn dark color="green" @click="saveGanjoorLinkSuggestion()">پیشنهاد<v-icon left>done</v-icon></v-btn>
                    </v-toolbar-items>
                </v-toolbar>
                <v-flex xs12>
                    <v-card>
                        <v-card-text>
                            در قاب سمت راست شعر مرتبط در گنجور را پیدا و مشخص کنید و در قاب سمت چپ تصویر مورد نظر را و نهایتاً روی دکمهٔ «<span color="green"><strong>پیشنهاد</strong></span>» کلیک کنید. می‌توانید بدون بستن پنجره این کار را برای شعرها و تصاویر بعدی تکرار کنید.
                        </v-card-text>
                    </v-card>
                </v-flex>
                <v-layout row wrap>
                    <v-flex xs6>
                        <iframe src="/ganjoor?url=https://ganjoor.net" ref="ganjoorFrame" style="width:50vw;height:70vh"></iframe>
                    </v-flex>
                    <v-flex xs6>
                        <iframe v-if="item != null" :src="`/items/${item.parentFriendlyUrl}/${item.item.friendlyUrl}`" style="width:50vw;height:70vh"></iframe>
                    </v-flex>
                </v-layout>
                <v-flex xs12>
                    <v-card v-if="longProcessInDialogs" dark color="secondary">
                        <v-progress-circular indeterminate></v-progress-circular>
                    </v-card>
                    <v-card v-if="!longProcessInDialogs">
                        <v-card-text>
                            {{suggestionResult}}
                        </v-card-text>
                    </v-card>
                </v-flex>

            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>

    import axios from "axios";
    import axiosErrorHandler from './../utilities/axiosErrorHandler';
    import { EventBus } from './../event-bus';
    import PermissionChecker from './../utilities/PermissionChecker';
    import strReplacer from './../utilities/strReplacer';
    import NotesThread from './NotesThread.vue';   
    import { Cropper } from 'vue-advanced-cropper'

    export default {
        name: 'ArtifactItem',
        components: {
            NotesThread,
            Cropper
        },

        data() {
            return {
                userInfo: null,
                item: null,
                errorMsg: '',
                addingTagType: false,
                addPredefinedTag:true,
                newTag: null,
                tagsArray: [],
                editingTagType: false,
                editingTagValue: false,
                tagObject: null,
                tagTypeArray: [
                    { text: 'عادی', value: 0 },
                    { text: 'پیوند', value: 1 },
                    { text: 'جستجو', value: 2 },
                    { text: 'پیوند و جستجو', value: 3 },
                    { text: 'عادی چپ به راست', value: 4 },
                    { text: 'بدون مقدار', value: 5 },
                    { text: 'عنوان در فهرست', value: 6 },
                ],
                tagName: '',
                tagPlural: '',
                tagType: { text: '', value: -1 },
                tagUrl: '',
                tagValueObject: null,
                tagValue: '',
                tagValueUrl: '',
                tagValueLink: '',
                tagValueEditGlobally: true,
                bookmarked: false,
                bookmarkId: '',
                loadingPrivateNotes: false,
                mynotes: [],
                writingPrivateNote: false,
                newNote: '',
                editingPrivateNote: false,
                editNote: null,
                loadingPublicNotes: false,
                publicnotes: null,
                writingPublicNote: false,
                editingPublicNote: false,
                active_tab: 'tab-1',
                hashNoteId: '',
                longProcessInDialogs: false,
                ganjoorLink: false,
                suggestionResult: '',
                imageAngle: 0,
                longProcessOnGoing: true,
                insertCroppedImage: false,
                coordinates: {width: 0, height: 0, left: 0,top: 0},
                
            }
        },
        mounted() {

           

            if(localStorage.getItem('userInfo')) {
                try {
                    this.userInfo = JSON.parse(localStorage.getItem('userInfo'));
                } catch (e) {
                    this.userInfo = null;
                }
            }
            EventBus.$on('user-logged-in', this.userLoggedIn);
            EventBus.$on('user-logged-out', this.userLoggedOut);

            if (this.$route.hash != '') {
                this.active_tab = 'tab-4';
            }

            this.loadItem();
            

        },
        methods: {
            userLoggedIn(userInfo){
                this.userInfo = userInfo;
            },
            userLoggedOut(){
                this.userInfo = null;
            },
            loadItem() {                      

                
                this.errorMsg = '';
                if (this.userInfo == null) {
                    this.longProcessOnGoing = true;
                    axios({ method: "GET", "url": this.appConfig.$api_url + "/api/artifacts/" + this.$route.params.friendlyUrl + "/" + this.$route.params.pageUrl, "data": {}, "headers": { "content-type": "application/json" } }).then(result => {
                    this.processItemResult(result);
                
                }, error => {
                    this.longProcessOnGoing = false;
                    this.errorMsg = axiosErrorHandler.handle(error);
                });
                }
                else {
                    this.longProcessOnGoing = true;
                    axios({
                        method: "GET", "url": this.appConfig.$api_url + "/api/artifacts/secure/" + this.$route.params.friendlyUrl + "/" + this.$route.params.pageUrl,
                        "data": {},
                        "headers":
                        {
                            "authorization": "bearer " + this.userInfo.token,
                            "content-type": "application/json"
                        }
                    }).then(result => {
                    this.processItemResult(result);
                
                }, error => {
                    this.longProcessOnGoing = false;
                    this.errorMsg = axiosErrorHandler.handle(error);
                });
                }
            },
            processItemResult(result) {
               
                this.imageAngle = 0;     
                if (this.$refs.image != null) {
                    this.$refs.image.className = 'hidden';
                }          

                this.item = result.data;
                document.title = 'گنجینهٔ گنجور - ' + this.item.parentName + ' - تصویر ' + this.item.item.order + ' از ' + this.item.parentItemCount;

                localStorage.setItem('parent', this.item.parentFriendlyUrl);
                localStorage.setItem('item', this.item.item.id);
                this.longProcessOnGoing = false;
                this.loadingPublicNotes = true;
                axios({
                    method: "GET", "url": this.appConfig.$api_url + "/api/artifacts/note/item/" + this.item.item.id,
                    "data": {},
                    "headers":
                    {
                        "content-type": "application/json"
                    }
                }).then(notes => {
                    this.publicnotes = notes.data;
                    this.loadingPublicNotes = false;
                    if (this.$route.hash) {
                        this.hashNoteId = this.$route.hash.substring(1);                       
                    }
                    else {
                        this.hashNoteId = '';
                    }
                }, error => {                            
                        this.errorMsg = axiosErrorHandler.handle(error);
                    });

                this.bookmarked = false;
                this.bookmarkId = '';
                if (this.userInfo != null) {
                    this.errorMsg = '';
                    axios({
                        method: "GET", "url": this.appConfig.$api_url + "/api/artifacts/bookmark/item/" + this.item.item.id,
                        "data": {},
                        "headers":
                        {
                            "authorization": "bearer " + this.userInfo.token,
                            "content-type": "application/json"
                        }
                    }).then(bookmarks => {
                        for (let i = 0; i < bookmarks.data.length; i++) {
                            if (bookmarks.data[i].rBookmarkType == 0) {//RBookmarkType.Bookmark => Private Bookmark
                                this.bookmarked = true;
                                this.bookmarkId = bookmarks.data[i].id;
                            }
                        }

                        this.loadingPrivateNotes = true;
                        axios({
                            method: "GET", "url": this.appConfig.$api_url + "/api/artifacts/note/item/private/" + this.item.item.id,
                            "data": {},
                            "headers":
                            {
                                "authorization": "bearer " + this.userInfo.token,
                                "content-type": "application/json"
                            }
                        }).then(notes => {
                            this.mynotes = notes.data;
                            this.loadingPrivateNotes = false;
                        }, error => {                            
                                this.errorMsg = axiosErrorHandler.handle(error);
                        });
                    }, error => {                            
                            this.errorMsg = axiosErrorHandler.handle(error);
                    });
                }                


            },
            addTag(rTag) {
                this.tagObject = rTag;
                this.tagName = '';
                this.errorMsg = '';
                axios({
                        method: "GET", "url": this.appConfig.$api_url + "/api/artifacts/tag",
                        "data": {},
                        "headers":
                        {
                            "content-type": "application/json"
                        }
                }).then(result => {
                    this.tagsArray = result.data;
                    if (this.tagObject != null) {
                        for (var i = 0; i < this.tagsArray.length; i++) {
                            if (this.tagObject.id == this.tagsArray[i].id) {
                                this.newTag = this.tagsArray[i];
                                break;
                            }
                        }
                    }
                    if (this.newTag == null && this.tagsArray.length > 0) {
                        this.newTag = this.tagsArray[0];
                    }
                    this.addPredefinedTag = true;
                    this.addingTagType = true;                    
                
                }, error => {
                    this.errorMsg = axiosErrorHandler.handle(error);
                });                
                
            },
            onAddTagOKClicked() {
                if (this.addPredefinedTag) {
                    this.addTagValue(this.newTag);
                }
                else
                {
                    this.longProcessInDialogs = true;
                    axios({
                    method: "POST", "url": this.appConfig.$api_url + "/api/artifacts/tag", "data":
                    {
                            name: this.tagName
                    },
                    "headers":
                    {
                        "authorization": "bearer " + this.userInfo.token,
                        "content-type": "application/json"
                    }
                    }).then((result) => { 
                        this.longProcessInDialogs = false;
                        this.addTagValue(result.data);                        
                    }, error => {
                             this.longProcessInDialogs = false;
                             this.errorMsg = axiosErrorHandler.handle(error);                    
                    });
                }                
            },
            addTagValue(rTag) {
                 this.longProcessInDialogs = true;
                axios({
                    method: "POST", "url": this.appConfig.$api_url + "/api/artifacts/itemtagvalue/" + this.item.item.id, "data": rTag,
                    "headers":
                    {
                        "authorization": "bearer " + this.userInfo.token,
                        "content-type": "application/json"
                    }
                }).then(() => {
                    this.longProcessInDialogs = false;
                    this.addingTagType = false;
                    this.loadItem();                    
                }, error => {
                        this.longProcessInDialogs = false;
                        this.errorMsg = axiosErrorHandler.handle(error);                    
                    });
                
            },
            editTag(rTag){
                this.tagObject = rTag;
                this.tagName = this.tagObject.name;
                this.tagPlural = this.tagObject.pluralName;
                for (var j = 0; j < this.tagTypeArray.length; j++) {
                    if (this.tagTypeArray[j].value === this.tagObject.tagType) {
                        this.tagType = this.tagTypeArray[j];
                        break;
                    }
                }

                this.tagUrl = this.tagObject.friendlyUrl;
                this.tagValueEditGlobally = this.tagObject.globalValue;

                this.editingTagType = true;
            },            
            onEditTagOKClicked() {
                this.tagObject.name = this.tagName;
                this.tagObject.pluralName = this.tagPlural;
                this.tagObject.friendlyUrl = this.tagUrl;
                this.tagObject.tagType = this.tagType.value;
                this.tagObject.globalValue = this.tagValueEditGlobally;

                this.errorMsg = '';
                this.longProcessInDialogs = true;
                axios({
                    method: "PUT", "url": this.appConfig.$api_url + "/api/artifacts/tag/" + this.tagObject.id, "data": this.tagObject,
                    "headers":
                    {
                        "authorization": "bearer " + this.userInfo.token,
                        "content-type": "application/json"
                    }
                }).then(() => {
                    this.longProcessInDialogs = false;
                    this.editingTagType = false;
                }, error => {
                        this.longProcessInDialogs = false;
                        this.editingTagType = false;
                        this.errorMsg = axiosErrorHandler.handle(error);
                });                
            },
            moveTag(tag, upOrDown) {
                this.errorMsg = '';
                axios({
                    method: "PUT", "url": this.appConfig.$api_url + "/api/artifacts/tag/move/" + tag.id + '/in/item/' + this.item.item.id + '/' + upOrDown , "data": {},
                    "headers":
                    {
                        "authorization": "bearer " + this.userInfo.token,
                        "content-type": "application/json"
                    }
                }).then(() => {
                    this.loadItem();
                }, error => {
                        this.errorMsg = axiosErrorHandler.handle(error);
                });
            },            
            editTagValue(rTagValue, rTag) {
                this.tagValueObject = rTagValue;
                this.tagValue = strReplacer.replaceArray(this.tagValueObject.value, ['<br>', '<br/>', '<br />'], '\r\n');
                this.tagValueUrl = this.tagValueObject.friendlyUrl;
                this.tagValueLink = this.tagValueObject.valueSupplement;

                this.tagValueEditGlobally = rTag.globalValue;

                this.editingTagValue = true;
            },
            onEditTagValueOKClicked() {
                this.tagValueObject.value = this.tagValue.replace('\n\r', '<br/>');
                this.tagValueObject.friendlyUrl = this.tagValueUrl;
                this.tagValueObject.valueSupplement = this.tagValueLink;

                this.errorMsg = '';
                this.longProcessInDialogs = true;
                axios({
                    method: "PUT", "url": this.appConfig.$api_url + "/api/artifacts/itemtagvalue/" + this.item.item.id + '/' + this.tagValueEditGlobally.toString(), "data": this.tagValueObject,
                    "headers":
                    {
                        "authorization": "bearer " + this.userInfo.token,
                        "content-type": "application/json"
                    }
                }).then(() => {
                    this.longProcessInDialogs = false;
                    this.editingTagValue = false;
                }, error => {
                        this.longProcessInDialogs = false;
                        this.editingTagValue = false;
                        this.errorMsg = axiosErrorHandler.handle(error);
                });                
            },
            removeTagValue(value) {
                if (confirm("از حذف این مقدار ویژگی اطمینان دارید؟")) {
                    this.errorMsg = '';
                    axios({
                        method: "DELETE", "url": this.appConfig.$api_url + "/api/artifacts/itemtagvalue/" + this.item.item.id + '/' + value.id, "data": {},
                    "headers":
                    {
                        "authorization": "bearer " + this.userInfo.token,
                        "content-type": "application/json"
                    }
                    }).then(() => {
                        this.loadItem();
                    }, error => {
                            this.errorMsg = axiosErrorHandler.handle(error);
                    });          
                }
            },
            moveValue(value, upOrDown) {
                this.errorMsg = '';
                axios({
                    method: "PUT", "url": this.appConfig.$api_url + "/api/artifacts/itemtagvalue/" + this.item.item.id + '/' + value.rTagId + '/' + value.id + '/move/' + upOrDown, "data": {},
                    "headers":
                    {
                        "authorization": "bearer " + this.userInfo.token,
                        "content-type": "application/json"
                    }
                }).then(() => {
                    this.loadItem();
                }, error => {
                        this.errorMsg = axiosErrorHandler.handle(error);
                });
            },
            getTagLink(rTag) {
                switch (rTag.tagType) {
                    case 2: //Search
                    case 3: //SearchLink
                    case 5: //Binary
                        return '/items/' + this.item.parentFriendlyUrl + '/tags/' + rTag.friendlyUrl;
                }
                return '';
            },
            getTagValueLink(rTagValue, rTag) {
                switch (rTag.tagType) {
                    case 2: //Search
                    case 3: //SearchLink
                        return '/items/' + this.item.parentFriendlyUrl + '/tags/' + rTag.friendlyUrl + '/' + rTagValue.friendlyUrl;
                }
                return ''; 
            },
            checkPermission(secShortName, opShortName) {
                return PermissionChecker.check(this.userInfo, secShortName, opShortName);
            },
            bookmark() {
                 this.errorMsg = '';
                if (this.bookmarked) {
                    axios({
                        method: "DELETE", "url": this.appConfig.$api_url + "/api/artifacts/bookmark/" + this.bookmarkId, "data": {},
                    "headers":
                    {
                        "authorization": "bearer " + this.userInfo.token,
                        "content-type": "application/json"
                    }
                    }).then(() => {
                        this.bookmarked = false;
                        this.bookmarkId = '';
                    }, error => {
                            this.errorMsg = axiosErrorHandler.handle(error);
                    });
                }
                else {                   
                axios({
                    method: "POST", "url": this.appConfig.$api_url + "/api/artifacts/bookmark/item/" + this.item.item.id , "data": {},
                    "headers":
                    {
                        "authorization": "bearer " + this.userInfo.token,
                        "content-type": "application/json"
                    }
                    }).then((result) => {
                        this.bookmarked = true;
                        this.bookmarkId = result.data.id;
                    }, error => {
                            this.errorMsg = axiosErrorHandler.handle(error);
                    });
                }
            },
            getbookmarkIcon() {
                return this.bookmarked ? 'star' : 'star_border';
            },
            getbookmarkTooltip() {
                return this.bookmarked ? 'حذف نشان' : 'نشان کردن';
            },
            saveNewNote(noteType) {
                if (this.userInfo == null) {
                    return;
                }
                this.errorMsg = '';
                if (this.newNote === '') {
                    this.errorMsg = 'متن یادداشت خالی است!';
                    return;
                }

                 var noteTypeCode = 0;
                if (noteType === 'public') {
                    noteTypeCode = 1;
                }

                axios({                    
                    method: "POST", "url": this.appConfig.$api_url + "/api/artifacts/note/item",
                    "data":
                    {
                        "entityId": this.item.item.id,
                        "noteType": noteTypeCode,
                        "contents": this.newNote.replace(/\r?\n/g, '<br/>')
                    },
                    "headers":
                    {
                        "authorization": "bearer " + this.userInfo.token,
                        "content-type": "application/json"
                    }
                  }).then((result) => {
                      if (noteType === 'private') {
                        this.mynotes.push(result.data);
                      }
                      else {
                          this.publicnotes.push(result.data);
                      }
                      this.newNote = '';
                      this.writingPrivateNote = false;
                      this.writingPublicNote = false;
                    }, error => {
                            this.errorMsg = axiosErrorHandler.handle(error);
                    });
            },
            deleteNote(note) {
                if (confirm('از حذف این یادداشت اطمینان دارید؟')) {
                    this.errorMsg = '';
                    axios({                    
                    method: "DELETE", "url": this.appConfig.$api_url + "/api/artifacts/note/" + note.id,
                    "data":{},
                    "headers":
                    {
                        "authorization": "bearer " + this.userInfo.token,
                        "content-type": "application/json"
                    }
                    }).then(() => {
                        if (note.noteType == 0) {
                            this.mynotes = this.mynotes.filter(function (value) {
                                return value != note;
                            });
                        }
                        else {
                            this.publicnotes = this.publicnotes.filter(function (value) {
                                return value != note;
                            });
                        }                 
                    }, error => {
                            this.errorMsg = axiosErrorHandler.handle(error);
                    });
                }
            },
            editCurrentNote(note, noteType) {
                if (this.writingPrivateNote || this.writingPublicNote) {
                    this.errorMsg = 'لطفا پس از تکمیل عملیات قبلی مجددا تلاش کنید.';
                    return;
                }
                this.newNote = strReplacer.replaceArray(note.htmlContent, ['<br>', '<br/>', '<br />'], '\r\n');
                this.editNote = note;
                this.editingPrivateNote = noteType === 'private';   
                this.editingPublicNote = noteType === 'public';                   
            },
            onEditNoteOKClicked() {
                this.errorMsg = '';
                if (this.newNote === '') {
                    this.errorMsg = 'متن یادداشت خالی است!';
                    return;
                }
                
                axios({
                    method: "PUT", "url": this.appConfig.$api_url + "/api/artifacts/note/" + this.editNote.id,
                    "data":
                    {
                        "entityId": this.item.item.id,
                        "noteType": this.editNote.noteType,
                        "contents": this.newNote.replace(/\r?\n/g, '<br/>')
                    },
                    "headers":
                    {
                        "authorization": "bearer " + this.userInfo.token,
                        "content-type": "application/json"
                    }
                }).then(() => {
                    this.editNote.htmlContent = this.newNote.replace(/\r?\n/g, '<br/>');
                    this.editingPrivateNote = false;
                    this.editingPublicNote = false;
                    this.newNote = '';
                    }, error => {
                            this.errorMsg = axiosErrorHandler.handle(error);
                    });
            },
            publicNoteColor(note) {
                if (note.id === this.hashNoteId) {
                    return '#952175';
                }
                return '';
            },          
           
            saveGanjoorLinkSuggestion() {
                 var ganjoorUrl =
                    strReplacer.replaceAll(
                        strReplacer.replaceAll(
                            this.$refs.ganjoorFrame.contentWindow.location.href.substring(this.$refs.ganjoorFrame.contentWindow.location.href.indexOf('=') + 1),
                            '%3A',
                            ':'),
                        '%2F',
                        '/');

                var ganjoorPostId = parseInt(localStorage.getItem('ganjoorPostId'));
                var ganjoorTitle = localStorage.getItem('ganjoorPostTitle');
                var sugArtifactFriendlyUrl = localStorage.getItem('parent');
                var sugItemId = localStorage.getItem('item');

                this.longProcessInDialogs = true;
                    axios({
                    method: "POST", "url": this.appConfig.$api_url + "/api/artifacts/ganjoor", "data":
                    {
                            ganjoorPostId,
                            ganjoorUrl,
                            ganjoorTitle,
                            artifactFriendlyUrl: sugArtifactFriendlyUrl,
                            itemId: sugItemId
                    },
                    "headers":
                    {
                        "authorization": "bearer " + this.userInfo.token,
                        "content-type": "application/json"
                    }
                    }).then((result) => { 
                        this.longProcessInDialogs = false;
                        this.suggestionResult = result.data.ganjoorTitle + ' <==> ' + result.data.entityName;                 
                    }, error => {
                             this.longProcessInDialogs = false;
                             this.suggestionResult = axiosErrorHandler.handle(error);                    
                    });

            },
            cover() {
                this.errorMsg = '';
                axios({
                    method: "PUT", "url": this.appConfig.$api_url + "/api/artifacts/" + this.item.item.rArtifactMasterRecordId + "/cover", "data":
                    (this.item.item.order - 1),
                    "headers":
                    {
                        "authorization": "bearer " + this.userInfo.token,
                        "content-type": "application/json"
                    }
                }).then(() => {                    
                    this.loadItem();     
                    alert('تصویر تغییر یافت. لطفا F5 بزنید.');
                }, error => {
                        this.error = axiosErrorHandler.handle(error);                    
                });
            },
            getViewerUrl() {
                var n = (this.item.item.order - 1);
                if (n % 2 == 0) {
                    n = n - 1;
                }
                if (n < 0) {
                    return 'http://viewer.ganjoor.net/' + this.item.parentFriendlyUrl;
                }                    
                return 'http://viewer.ganjoor.net/' + this.item.parentFriendlyUrl + '#page/n' + n + '/mode/2up';
            },
            rotate(angle) {               
                if (angle == 0) {
                    this.imageAngle = 0;
                    this.$refs.image.className = 'hidden';
                }
                else {
                    this.imageAngle += angle;
                    this.imageAngle = this.imageAngle % 360;
                    this.$refs.image.className = 'rotate' + this.imageAngle;
                }                
            },
            saveRotation() {
                if (this.imageAngle != 0) {
                    if (confirm('از ذخیرهٔ چرخش فعلی اطمینان دارید؟')) {
                        this.longProcessOnGoing = true;
                        this.errorMsg = '';
                        axios({
                            method: "PUT", "url": this.appConfig.$api_url + "/api/images/" + this.item.item.images[0].id + "/" + this.imageAngle.toString(), "data": {}
                            ,
                            "headers":
                            {
                                "authorization": "bearer " + this.userInfo.token,
                                "content-type": "application/json"
                            }
                        }).then(() => {      
                            this.longProcessOnGoing = false;
                            this.loadItem();     
                            alert('چرخش انجام شد. لطفا F5 بزنید.');
                        }, error => {
                                this.longProcessOnGoing = false;
                                this.error = axiosErrorHandler.handle(error);                    
                        });
                    }
                }
            },
            tagHasImage() {
                for (let i = 0; i < this.item.formattedTags.length; i++) {
                    if (this.item.formattedTags[i].friendlyUrl == 'illustrated') {
                        alert('پیشتر ثبت شده است.');
                        return;
                    }
                }

                this.longProcessOnGoing = true;
                axios({
                        method: "GET", "url": this.appConfig.$api_url + "/api/artifacts/tag",
                        "data": {},
                        "headers":
                        {
                            "content-type": "application/json"
                        }
                }).then(result => {
                    
                    this.tagsArray = result.data;
                     for (var i = 0; i < this.tagsArray.length; i++) {
                    if (this.tagsArray[i].friendlyUrl == 'illustrated') {

                        axios({
                            method: "POST", "url": this.appConfig.$api_url + "/api/artifacts/itemtagvalue/" + this.item.item.id, "data": this.tagsArray[i],
                            "headers":
                            {
                                "authorization": "bearer " + this.userInfo.token,
                                "content-type": "application/json"
                            }
                        }).then(() => {
                            this.longProcessOnGoing = false;
                            alert('انجام شد. لطفا F5‌بزنید.');
                        }, secErr => {
                                this.longProcessOnGoing = false;
                                this.errorMsg = axiosErrorHandler.handle(secErr);                    
                            });
                        break;
                    }
                }                
                
                }, error => {
                    this.longProcessOnGoing = false;
                    this.errorMsg = axiosErrorHandler.handle(error);
                });            

               


            },
            cropperCoordinatesChanged({coordinates, }) {
                this.coordinates = coordinates;
            },
            onCropOKClicked() {
                this.longProcessInDialogs = true;
                axios({
                    method: "GET",
                    "url": this.appConfig.$api_url + "/api/images/cropped/" + this.item.item.images[0].id + "?left=" + this.coordinates.left + "&top=" + this.coordinates.top + "&width=" + this.coordinates.width + "&height=" + this.coordinates.height,
                        "data": {},
                        "headers":
                        {
                            "authorization": "bearer " + this.userInfo.token,
                            "content-type": "application/json"
                        }
                }).then(result => {
                    this.newNote += '\r\n';
                    this.newNote += '<img src="';
                    this.newNote += this.appConfig.$api_url + '/api/rimages/';
                    this.newNote += result.data.id;
                    this.newNote += '.jpg" alt = "برش تصویر" />';

                    this.insertCroppedImage = false;
                    this.longProcessInDialogs = false;
                
                }, error => {
                    this.insertCroppedImage = false;
                    this.longProcessInDialogs = false;
                    this.errorMsg = axiosErrorHandler.handle(error);
                });            
               
            }
        },
          watch: { //https://stackoverflow.com/a/41298520/66657
              $route() {                  
                  this.loadItem();
            }
          }       
    }
</script>

<style scoped>
    .coverImage {
        margin: auto
    }

    .centeredimg{
        margin:auto
    }

    .clickable {
        cursor: pointer
    }   

    #image {
      transform-origin: top left;
      /* IE 10+, Firefox, etc. */
      -webkit-transform-origin: top left;
      /* Chrome */
      -ms-transform-origin: top left;
      /* IE 9 */
      display:none;
    }

    #image .hidden{
      display:none;
    }

    #image.rotate90 {
      display:block;
      transform: rotate(90deg) translateY(-100%);
      -webkit-transform: rotate(90deg) translateY(-100%);
      -ms-transform: rotate(90deg) translateY(-100%);
    }
    #image.rotate180 {
      display:block;
      transform: rotate(180deg) translate(-100%, -100%);
      -webkit-transform: rotate(180deg) translate(-100%, -100%);
      -ms-transform: rotate(180deg) translateX(-100%, -100%);
    }
    #image.rotate270 {
      display:block;
      transform: rotate(270deg) translateX(-100%);
      -webkit-transform: rotate(270deg) translateX(-100%);
      -ms-transform: rotate(270deg) translateX(-100%);
    }
    
</style>