<template>
  <v-container grid-list-md text-center>
    <v-layout wrap>
      <v-flex v-if="item == null" xs12>
        <v-card dark color="secondary">
          <v-progress-circular indeterminate></v-progress-circular>
        </v-card>
      </v-flex>

      <v-flex v-if="errorMsg != ''" xs12>
        <v-card>
          <v-card-text>{{ errorMsg }}</v-card-text>
        </v-card>
      </v-flex>

      <v-flex xs4>
        <v-card dark color="secondary">
          <v-card-text v-if="item != null">
            <v-img
              :src="`${item.coverImage.externalNormalSizeImageUrl
                .replace('/norm/', '/thumb/')
                .replace('/orig/', '/thumb/')}`"
              max-width="200px"
              class="grey lighten-2 clickable coverImage"
              @click="coverImageClicked()"
            >
              <template v-slot:placeholder>
                <v-layout fill-height align-center justify-center ma-0>
                  <v-progress-circular
                    indeterminate
                    color="grey lighten-5"
                  ></v-progress-circular>
                </v-layout>
              </template>
            </v-img>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-chip
                  outlined
                  color="white"
                  v-on="on"
                  v-on:click="showCoverImage()"
                  ><v-icon dark>image</v-icon></v-chip
                >
              </template>
              <span>مشاهدهٔ تصویر متناظر جلد</span>
            </v-tooltip>
            <a :href="`https://viewer.ganjoor.net/${item.friendlyUrl}`">
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-chip outlined color="white" v-on="on" class="clickable"
                    ><v-icon dark>local_library</v-icon></v-chip
                  >
                </template>
                <span>مشاهده در نمای کتابخوان</span>
              </v-tooltip>
            </a>
          </v-card-text>
          <v-card dark color="primary">
            <v-card-text v-if="item != null">
              {{ item.name }} <small>({{ item.itemCount }} تصویر)</small>
              <v-tooltip v-if="userInfo != null" bottom>
                <template v-slot:activator="{ on }">
                  <v-btn
                    text
                    icon
                    color="yellow"
                    v-on="on"
                    v-on:click="bookmark()"
                  >
                    <v-icon>{{ getbookmarkIcon() }}</v-icon>
                  </v-btn>
                </template>
                <span>{{ getbookmarkTooltip() }}</span>
              </v-tooltip>
            </v-card-text>
            <v-card-text v-if="item != null && filteredTag != null"
              >تصاویر با ویژگی {{ filteredTag.name }}
              <span v-if="filteredTagValue != null">
                دارای مقدار {{ filteredTagValue.value }}</span
              >&nbsp;<small>({{ item.itemCount }} تصویر)</small></v-card-text
            >
          </v-card>
          <!-- edit name begin -->
          <v-layout
            justify-center
            v-if="item != null && checkPermission('artifact', 'modify')"
          >
            <v-dialog v-model="editingName" width="500">
              <template v-slot:activator="{ on }">
                <v-btn text icon color="white" dark v-on="on">
                  <v-icon>edit</v-icon>
                </v-btn>
              </template>

              <v-card>
                <v-card-text>
                  <v-text-field label="نام" v-model="itemName"></v-text-field>
                </v-card-text>

                <v-card-text>
                  <v-text-field label="نشانی" v-model="itemUrl"></v-text-field>
                </v-card-text>

                <v-card-text>
                  <v-select
                    v-model="itemStatus"
                    :items="statusArray"
                    label="وضعیت"
                    hint="وضعیت"
                    persistent-hint
                    return-object
                    single-line
                  ></v-select>
                </v-card-text>

                <v-progress-linear
                  v-if="longProcessInDialogs"
                  indeterminate
                ></v-progress-linear>
                <v-divider></v-divider>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" @click="onEditNameOKClicked()"
                    >تأیید</v-btn
                  >
                  <v-btn color="secondary" text @click="editingName = false"
                    >انصراف</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-layout>
          <!-- edit name end -->
          <!-- category source begin -->
          <v-layout
            justify-center
            v-if="
              item != null &&
              checkPermission('artifact', 'modify') &&
              item.status == 4
            "
          >
            <v-dialog v-model="ganjoorLinking" width="500">
              <template v-slot:activator="{ on }">
                <v-btn text icon color="white" dark v-on="on">
                  <v-icon>link</v-icon>
                </v-btn>
              </template>

              <v-card>
                <v-card-text>
                  <v-text-field
                    label="شناسهٔ بخش"
                    v-model="ganjoorCatId"
                  ></v-text-field>
                </v-card-text>

                <v-progress-linear
                  v-if="longProcessInDialogs"
                  indeterminate
                ></v-progress-linear>
                <v-divider></v-divider>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" @click="onGanjoorLinkingClicked()"
                    >تأیید</v-btn
                  >
                  <v-btn color="secondary" text @click="ganjoorLinking = false"
                    >انصراف</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-layout>
          <!-- category source end -->
          <v-tooltip
            v-if="
              item != null &&
              checkPermission('artifact', 'delete') &&
              item.status != 4
            "
            bottom
          >
            <template v-slot:activator="{ on }">
              <v-btn
                icon
                text
                color="white"
                v-on="on"
                v-on:click="deleteArtifact()"
                ><v-icon dark>delete</v-icon></v-btn
              >
            </template>
            <span>حذف</span>
          </v-tooltip>
        </v-card>
      </v-flex>
      <v-flex xs8>
        <v-card>
          <v-tabs v-if="item != null" v-model="active_tab">
            <v-tab :href="`#tab-1`">توضیحات</v-tab>
            <v-tab :href="`#tab-2`">ویژگیها</v-tab>
            <v-tab v-if="item.contents.length > 0" :href="`#tab-3`"
              >فهرست</v-tab
            >
            <v-tab v-if="userInfo != null" :href="`#tab-4`"
              >یادداشتهای شخصی</v-tab
            >
            <v-tab :href="`#tab-5`">یادداشتهای عمومی</v-tab>
          </v-tabs>
          <v-tabs-items v-if="item != null" v-model="active_tab">
            <v-tab-item :value="`tab-1`">
              <v-card>
                <v-card-text v-html="item.description"></v-card-text>
              </v-card>
              <v-card dark color="secondary">
                <!-- edit description begin -->
                <v-layout
                  justify-center
                  v-if="checkPermission('artifact', 'modify')"
                >
                  <v-dialog v-model="editingDescription" width="500">
                    <template v-slot:activator="{ on }">
                      <v-btn text icon color="white" dark v-on="on">
                        <v-icon>edit</v-icon>
                      </v-btn>
                    </template>

                    <v-card>
                      <v-card-text>
                        <v-textarea
                          label="توضیحات"
                          auto-grow
                          rows="20"
                          v-model="itemDescription"
                        ></v-textarea>
                      </v-card-text>

                      <v-progress-linear
                        v-if="longProcessInDialogs"
                        indeterminate
                      ></v-progress-linear>
                      <v-divider></v-divider>

                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                          color="primary"
                          @click="onEditDescriptionOKClicked()"
                          >تأیید</v-btn
                        >
                        <v-btn
                          color="secondary"
                          text
                          @click="editingDescription = false"
                          >انصراف</v-btn
                        >
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-layout>
                <!-- edit description end -->
              </v-card>
            </v-tab-item>
            <v-tab-item :value="`tab-2`">
              <v-card
                v-if="
                  checkPermission('tag', 'modify') &&
                  item.artifactTags.length == 0
                "
              >
                <v-card-text>
                  <v-btn text icon v-on:click="addTag(null)">
                    <v-icon>add</v-icon>
                  </v-btn>
                </v-card-text>
              </v-card>
              <v-simple-table>
                <tbody>
                  <tr v-for="tag in item.artifactTags" :key="tag.id">
                    <td
                      v-if="
                        tag.friendlyUrl != null &&
                        (tag.tagType == 2 || tag.tagType == 3)
                      "
                    >
                      <router-link :to="`/tags/${tag.friendlyUrl}`">
                        {{ tag.name }}
                      </router-link>
                    </td>
                    <td
                      v-if="
                        tag.friendlyUrl == null ||
                        (tag.tagType != 2 && tag.tagType != 3)
                      "
                    >
                      {{ tag.name }}
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
                            <td
                              v-if="
                                tag.friendlyUrl != null &&
                                value.friendlyUrl != null &&
                                (tag.tagType == 2 || tag.tagType == 3)
                              "
                            >
                              <router-link
                                :to="`/tags/${tag.friendlyUrl}/${value.friendlyUrl}`"
                              >
                                {{ value.value }}
                              </router-link>
                            </td>
                            <td
                              v-if="
                                ((tag.tagType == 2 || tag.tagType == 3) &&
                                  (tag.friendlyUrl == null ||
                                    value.friendlyUrl == null)) ||
                                (tag.tagType != 2 &&
                                  tag.tagType != 3 &&
                                  tag.tagType != 4)
                              "
                              v-html="value.value"
                            ></td>
                            <td
                              v-if="tag.tagType == 4"
                              class="ltrvalue"
                              v-html="value.value"
                            ></td>

                            <td
                              v-if="tag.tagType == 1 || tag.tagType == 3"
                              class="btnedttagvalue"
                            >
                              <a :href="value.valueSupplement" target="_blank">
                                <v-btn text icon color="primary">
                                  <v-icon>open_in_new</v-icon>
                                </v-btn>
                              </a>
                            </td>
                            <td
                              v-if="checkPermission('artifact', 'edittag')"
                              class="btnedttagvalue"
                            >
                              <v-btn
                                text
                                icon
                                v-on:click="editTagValue(value, tag)"
                              >
                                <v-icon>edit</v-icon>
                              </v-btn>
                              <v-btn
                                text
                                icon
                                v-on:click="removeTagValue(value)"
                              >
                                <v-icon>delete</v-icon>
                              </v-btn>
                              <v-btn
                                text
                                icon
                                v-on:click="moveValue(value, 'up')"
                              >
                                <v-icon>arrow_drop_up</v-icon>
                              </v-btn>
                              <v-btn
                                text
                                icon
                                v-on:click="moveValue(value, 'down')"
                              >
                                <v-icon>arrow_drop_down</v-icon>
                              </v-btn>
                            </td>
                          </tr>
                        </tbody>
                      </v-simple-table>
                    </td>
                  </tr>
                  <tr
                    v-for="rTagSum in item.rTagSums"
                    :key="rTagSum.tagFriendlyUrl"
                  >
                    <td>
                      <router-link
                        :to="`/items/${item.friendlyUrl}/tags/${rTagSum.tagFriendlyUrl}`"
                      >
                        {{ rTagSum.tagName }}
                      </router-link>
                    </td>
                    <td v-if="checkPermission('tag', 'modify')"></td>
                    <td>
                      <router-link
                        :to="`/items/${item.friendlyUrl}/tags/${rTagSum.tagFriendlyUrl}`"
                      >
                        {{ rTagSum.itemCount }} تصویر
                      </router-link>
                    </td>
                    <td v-if="checkPermission('tag', 'modify')"></td>
                  </tr>
                </tbody>
              </v-simple-table>

              <!-- add tag begin -->
              <v-layout justify-center v-if="checkPermission('tag', 'modify')">
                <v-dialog v-model="addingTagType" width="500">
                  <v-card>
                    <v-card-text>
                      <v-checkbox
                        v-model="addPredefinedTag"
                        label="ویژگی از پیش تعریف شده"
                      >
                      </v-checkbox>
                    </v-card-text>

                    <v-card-text v-if="!addPredefinedTag">
                      <v-text-field
                        label="نام انگلیسی ویژگی"
                        v-model="tagName"
                      ></v-text-field>
                    </v-card-text>

                    <v-card-text v-if="addPredefinedTag">
                      <v-select
                        v-model="newTag"
                        :items="tagsArray"
                        label="نام ویژگی"
                        hint="نام ویژگی"
                        item-text="name"
                        item-value="id"
                        persistent-hint
                        return-object
                        single-line
                      ></v-select>
                    </v-card-text>

                    <v-progress-linear
                      v-if="longProcessInDialogs"
                      indeterminate
                    ></v-progress-linear>
                    <v-divider></v-divider>

                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="primary" @click="onAddTagOKClicked()"
                        >تأیید</v-btn
                      >
                      <v-btn
                        color="secondary"
                        text
                        @click="addingTagType = false"
                        >انصراف</v-btn
                      >
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-layout>
              <!-- add tag end -->
              <!-- edit tag name begin -->
              <v-layout justify-center v-if="checkPermission('tag', 'modify')">
                <v-dialog v-model="editingTagType" width="500">
                  <v-card>
                    <v-card-text>
                      <v-text-field
                        label="نام ویژگی"
                        v-model="tagName"
                      ></v-text-field>
                    </v-card-text>

                    <v-card-text>
                      <v-text-field
                        label="اسم جمع"
                        v-model="tagPlural"
                      ></v-text-field>
                    </v-card-text>

                    <v-card-text>
                      <v-select
                        v-model="tagType"
                        :items="tagTypeArray"
                        label="نوع"
                        hint="نوع"
                        persistent-hint
                        return-object
                        single-line
                      ></v-select>
                    </v-card-text>

                    <v-card-text>
                      <v-text-field
                        label="نشانی جستجو"
                        v-model="tagUrl"
                      ></v-text-field>
                    </v-card-text>

                    <v-card-text>
                      <v-checkbox
                        label="معمولا همه مقادیر یکسان فارغ از نوع تغییر می‌کند"
                        v-model="tagValueEditGlobally"
                      ></v-checkbox>
                    </v-card-text>

                    <v-progress-linear
                      v-if="longProcessInDialogs"
                      indeterminate
                    ></v-progress-linear>
                    <v-divider></v-divider>

                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="primary" @click="onEditTagOKClicked()"
                        >تأیید</v-btn
                      >
                      <v-btn
                        color="secondary"
                        text
                        @click="editingTagType = false"
                        >انصراف</v-btn
                      >
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-layout>
              <!-- edit tag name end -->
              <!-- edit tag value begin -->
              <v-layout
                justify-center
                v-if="checkPermission('artifact', 'edittag')"
              >
                <v-dialog v-model="editingTagValue" width="500">
                  <v-card>
                    <v-card-text>
                      <v-textarea
                        label="ویژگی"
                        auto-grow
                        rows="10"
                        v-model="tagValue"
                      ></v-textarea>
                    </v-card-text>

                    <v-card-text>
                      <v-text-field
                        label="نشانی جستجو"
                        v-model="tagValueUrl"
                      ></v-text-field>
                    </v-card-text>

                    <v-card-text>
                      <v-text-field
                        label="پیوند"
                        v-model="tagValueLink"
                      ></v-text-field>
                    </v-card-text>

                    <v-card-text>
                      <v-checkbox
                        label="همه مقادیر یکسان تغییر کنند"
                        v-model="tagValueEditGlobally"
                      ></v-checkbox>
                    </v-card-text>

                    <v-progress-linear
                      v-if="longProcessInDialogs"
                      indeterminate
                    ></v-progress-linear>
                    <v-divider></v-divider>

                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="primary" @click="onEditTagValueOKClicked()"
                        >تأیید</v-btn
                      >
                      <v-btn
                        color="secondary"
                        text
                        @click="editingTagValue = false"
                        >انصراف</v-btn
                      >
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-layout>
              <!-- edit tag value end -->
            </v-tab-item>
            <v-tab-item v-if="item.contents.length > 0" :value="`tab-3`">
              <v-simple-table>
                <tbody>
                  <tr v-for="content in item.contents" :key="content.order">
                    <td>
                      <p :style="`font-size:1.${content.level}em`">
                        <router-link
                          :to="`/items/${item.friendlyUrl}/${content.itemFriendlyUrl}`"
                        >
                          {{ content.title }}
                        </router-link>
                      </p>
                    </td>
                  </tr>
                </tbody>
              </v-simple-table>
            </v-tab-item>
            <v-tab-item v-if="userInfo != null" :value="`tab-4`">
              <v-flex v-if="loadingPrivateNotes" xs12>
                <v-card dark color="secondary">
                  <v-progress-circular indeterminate></v-progress-circular>
                </v-card>
              </v-flex>
              <v-card v-for="note in mynotes" :key="note.id">
                <v-card-text v-html="note.htmlContent"></v-card-text>
                <v-card-actions>
                  <small v-html="note.dateTime"></small>
                  <v-spacer></v-spacer>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        text
                        icon
                        color="blue"
                        v-on="on"
                        v-on:click="editCurrentNote(note, 'private')"
                      >
                        <v-icon>edit</v-icon>
                      </v-btn>
                    </template>
                    <span>اصلاح</span>
                  </v-tooltip>
                  <!-- edit note begin -->
                  <v-layout justify-center v-if="editingPrivateNote">
                    <v-dialog v-model="editingPrivateNote" width="500">
                      <v-card>
                        <v-textarea
                          v-model="newNote"
                          auto-grow
                          outlined
                          rounded
                        ></v-textarea>

                        <v-progress-linear
                          v-if="longProcessInDialogs"
                          indeterminate
                        ></v-progress-linear>
                        <v-divider></v-divider>

                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn color="primary" @click="onEditNoteOKClicked()"
                            >تأیید</v-btn
                          >
                          <v-btn
                            color="secondary"
                            text
                            @click="editingPrivateNote = false"
                            >انصراف</v-btn
                          >
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                  </v-layout>
                  <!-- edit note end -->
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        text
                        icon
                        color="red"
                        v-on="on"
                        v-on:click="deleteNote(note)"
                      >
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
                  <v-textarea
                    v-model="newNote"
                    auto-grow
                    outlined
                    rounded
                  ></v-textarea>
                  <v-btn text v-on:click="saveNewNote('private')">
                    ذخیره <v-icon>save</v-icon>
                  </v-btn>
                  <v-btn text v-on:click="writingPrivateNote = false">
                    انصراف <v-icon>cancel</v-icon>
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-tab-item>
            <v-tab-item :value="`tab-5`">
              <v-flex v-if="loadingPublicNotes" xs12>
                <v-card dark color="secondary">
                  <v-progress-circular indeterminate></v-progress-circular>
                </v-card>
              </v-flex>
              <NotesThread
                v-if="publicnotes != null"
                :entity="`artifact`"
                :notes="publicnotes"
                :hashNoteId="hashNoteId"
                :itemId="item.id"
                :level="0"
              />
            </v-tab-item>
          </v-tabs-items>
        </v-card>

        <v-card>
          <div class="text-center">
            <v-flex v-if="loadingItems" xs12>
              <v-card dark color="secondary">
                <v-progress-circular indeterminate></v-progress-circular>
              </v-card>
            </v-flex>
            <v-pagination
              v-model="pageNumber"
              :length="pageCount"
              total-visible="5"
              circle
              prev-icon="mdi-menu-left"
              next-icon="mdi-menu-right"
              @input="pageNumberChanged"
            ></v-pagination>
          </div>
        </v-card>

        <v-card>
          <v-container v-if="pageItems != null" grid-list-sm fluid>
            <v-layout row wrap>
              <v-flex
                v-for="artifactItem in pageItems"
                :key="artifactItem.id"
                d-flex
              >
                <v-card flat tile class="d-flex">
                  <router-link
                    :to="`/items/${item.friendlyUrl}/${artifactItem.friendlyUrl}`"
                  >
                    <v-img
                      :src="`${artifactItem.images[0].externalNormalSizeImageUrl
                        .replace('/norm/', '/thumb/')
                        .replace('/orig/', '/thumb/')}`"
                      max-width="200px"
                      max-height="400px"
                      class="grey lighten-2 clickable"
                    >
                      <template v-slot:placeholder>
                        <v-layout fill-height align-center justify-center ma-0>
                          <v-progress-circular
                            indeterminate
                            color="grey lighten-5"
                          ></v-progress-circular>
                        </v-layout>
                      </template>
                      <v-chip outlined color="white"
                        >{{ artifactItem.order
                        }}<v-icon dark>remove_red_eye</v-icon></v-chip
                      >
                    </v-img>
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
import axiosErrorHandler from "./../utilities/axiosErrorHandler";
import { EventBus } from "./../event-bus";
import PermissionChecker from "./../utilities/PermissionChecker";
import strReplacer from "./../utilities/strReplacer";
import NotesThread from "./NotesThread.vue";

export default {
  name: "Artifact",
  components: {
    NotesThread,
  },
  data() {
    return {
      userInfo: null,
      item: null,
      pageItems: null,
      pageSize: 21,
      pageNumber: 1,
      pageCount: 0,
      editingName: false,
      editingDescription: false,
      editingTagType: false,
      editingTagValue: false,
      ganjoorLinking: false,
      ganjoorCatId: 0,
      errorMsg: "",
      itemName: "",
      itemUrl: "",
      itemStatus: { text: "", value: -1 },
      statusArray: [
        { text: "پیش‌نویس", value: 0 },
        { text: "در انتظار بازبینی", value: 1 },
        { text: "رد شده", value: 2 },
        { text: "منتشر شده", value: 4 },
        { text: "دسترسی محدود", value: 8 },
      ],
      addingTagType: false,
      addPredefinedTag: true,
      newTag: null,
      tagsArray: [],
      tagObject: null,
      tagTypeArray: [
        { text: "عادی", value: 0 },
        { text: "پیوند", value: 1 },
        { text: "جستجو", value: 2 },
        { text: "پیوند و جستجو", value: 3 },
        { text: "عادی چپ به راست", value: 4 },
        { text: "بدون مقدار", value: 5 },
      ],
      tagName: "",
      tagPlural: "",
      tagType: { text: "", value: -1 },
      tagUrl: "",
      tagValueObject: null,
      tagValue: "",
      tagValueUrl: "",
      tagValueLink: "",
      tagValueEditGlobally: true,
      filteredTag: null,
      filteredTagValue: null,
      bookmarked: false,
      bookmarkId: "",
      loadingPrivateNotes: false,
      mynotes: [],
      writingPrivateNote: false,
      newNote: "",
      editingPrivateNote: false,
      editNote: null,
      loadingPublicNotes: false,
      publicnotes: null,
      active_tab: "tab-1",
      hashNoteId: "",
      longProcessInDialogs: false,
      loadingItems: false,
    };
  },
  mounted() {
    if (localStorage.getItem("userInfo")) {
      try {
        this.userInfo = JSON.parse(localStorage.getItem("userInfo"));
      } catch (e) {
        this.userInfo = null;
      }
    }

    EventBus.$on("user-logged-in", this.userLoggedIn);
    EventBus.$on("user-logged-out", this.userLoggedOut);

    if (this.$route.hash != "") {
      this.active_tab = "tab-5";
    }

    this.loadArtifact();
  },
  methods: {
    loadArtifact() {
      var apiUrl;
      if (this.userInfo == null) {
        apiUrl =
          this.appConfig.$api_url +
          "/api/artifacts/" +
          this.$route.params.friendlyUrl;
        if (this.$route.params.tag != null) {
          apiUrl += "/filteritemsbytag/" + this.$route.params.tag;
          if (this.$route.params.value != null) {
            apiUrl += "/" + this.$route.params.value;
          }
        } else {
          apiUrl =
            this.appConfig.$api_url +
            "/api/artifacts/limited/" +
            this.$route.params.friendlyUrl +
            "/21";
        }
        axios({
          method: "GET",
          url: apiUrl,
          data: {},
          headers: { "content-type": "application/json" },
        }).then(
          (result) => {
            this.processArtifactResult(result);
          },
          (error) => {
            this.errorMsg = axiosErrorHandler.handle(error);
          }
        );
      } else {
        apiUrl =
          this.appConfig.$api_url +
          "/api/artifacts/secure/" +
          this.$route.params.friendlyUrl;
        if (this.$route.params.tag != null) {
          apiUrl += "/filteritemsbytag/" + this.$route.params.tag;
          if (this.$route.params.value != null) {
            apiUrl += "/" + this.$route.params.value;
          }
        }
        axios({
          method: "GET",
          url: apiUrl,
          data: {},
          headers: {
            authorization: "bearer " + this.userInfo.token,
            "content-type": "application/json",
          },
        }).then(
          (result) => {
            this.processArtifactResult(result);
          },
          (error) => {
            this.errorMsg = axiosErrorHandler.handle(error);
          }
        );
      }
    },
    processArtifactResult(result) {
      this.item = result.data;
      this.pageNumber = 1;
      if (this.$route.params.pageno != null) {
        this.pageNumber = parseInt(this.$route.params.pageno);
      }

      var selectedItems = [];
      if (this.$route.params.tag != null) {
        //no paging
        for (var k = 0; k < this.item.items.length; k++) {
          selectedItems.push(this.item.items[k]);
        }
        this.pageItems = selectedItems;
        this.pageCount = 1;
      } else {
        this.pageCount =
          this.item.itemCount % this.pageSize == 0
            ? parseInt(this.item.itemCount / this.pageSize, 10)
            : parseInt(this.item.itemCount / this.pageSize, 10) + 1;
        this.pageNumberChangedWithRouterChangeParam(this.pageNumber, false);
      }

      this.itemName = this.item.name;
      this.itemUrl = this.item.friendlyUrl;
      for (var j = 0; j < this.statusArray.length; j++) {
        if (this.statusArray[j].value === this.item.status) {
          this.itemStatus = this.statusArray[j];
          break;
        }
      }

      this.itemDescription = strReplacer.replaceArray(
        this.item.description,
        ["<br>", "<br/>", "<br />"],
        "\r\n"
      );

      this.errorMsg = "";

      this.loadingPublicNotes = true;
      axios({
        method: "GET",
        url: this.appConfig.$api_url + "/api/artifacts/note/" + this.item.id,
        data: {},
        headers: {
          "content-type": "application/json",
        },
      }).then(
        (notes) => {
          this.publicnotes = notes.data;
          this.loadingPublicNotes = false;
          if (this.$route.hash) {
            this.hashNoteId = this.$route.hash.substring(1);
          } else {
            this.hashNoteId = "";
          }
        },
        (error) => {
          this.errorMsg = axiosErrorHandler.handle(error);
        }
      );

      this.bookmarked = false;
      this.bookmarkId = "";
      if (this.userInfo != null) {
        axios({
          method: "GET",
          url:
            this.appConfig.$api_url + "/api/artifacts/bookmark/" + this.item.id,
          data: {},
          headers: {
            authorization: "bearer " + this.userInfo.token,
            "content-type": "application/json",
          },
        }).then(
          (bookmarks) => {
            for (let i = 0; i < bookmarks.data.length; i++) {
              if (bookmarks.data[i].rBookmarkType == 0) {
                //RBookmarkType.Bookmark => Private Bookmark
                this.bookmarked = true;
                this.bookmarkId = bookmarks.data[i].id;
              }
            }

            this.loadingPrivateNotes = true;
            axios({
              method: "GET",
              url:
                this.appConfig.$api_url +
                "/api/artifacts/note/private/" +
                this.item.id,
              data: {},
              headers: {
                authorization: "bearer " + this.userInfo.token,
                "content-type": "application/json",
              },
            }).then(
              (notes) => {
                this.mynotes = notes.data;
                this.loadingPrivateNotes = false;
              },
              (error) => {
                this.errorMsg = axiosErrorHandler.handle(error);
              }
            );
          },
          (error) => {
            this.errorMsg = axiosErrorHandler.handle(error);
          }
        );
      }

      if (this.$route.params.tag != null) {
        axios({
          method: "GET",
          url:
            this.appConfig.$api_url +
            "/api/artifacts/tag/" +
            this.$route.params.tag,
          data: {},
          headers: {
            "content-type": "application/json",
          },
        }).then(
          (result) => {
            this.filteredTag = result.data;
            if (this.$route.params.value != null) {
              this.errorMsg = "";
              axios({
                method: "GET",
                url:
                  this.appConfig.$api_url +
                  "/api/artifacts/tagvalue/" +
                  this.filteredTag.id +
                  "/" +
                  this.$route.params.value,
                data: {},
                headers: {
                  "content-type": "application/json",
                },
              }).then(
                (tagvalue) => {
                  this.filteredTagValue = tagvalue.data;
                  this.setPageTitle();
                },
                (error) => {
                  this.errorMsg = axiosErrorHandler.handle(error);
                }
              );
            } else {
              this.setPageTitle();
            }
          },
          (error) => {
            this.errorMsg = axiosErrorHandler.handle(error);
          }
        );
      } else {
        this.setPageTitle();
      }
    },
    setPageTitle() {
      var title = "گنجینهٔ گنجور";
      if (this.item != null) {
        title += " - " + this.item.name;
        if (this.filteredTag != null) {
          title += " - " + this.filteredTag.name;
        }
        if (this.filteredTagValue != null) {
          title += " - " + this.filteredTagValue.value;
        }
      }
      document.title = title;
    },
    pageNumberChanged(pageNumber) {
      this.pageNumberChangedWithRouterChangeParam(pageNumber, true);
    },
    pageNumberChangedWithRouterChangeParam(pageNumber, routerChange) {
      if (this.item.items.length > (this.pageNumber - 1) * this.pageSize) {
        var selectedItems = [];
        for (
          var i = (this.pageNumber - 1) * this.pageSize;
          i < Math.min(this.pageNumber * this.pageSize, this.item.items.length);
          i++
        ) {
          selectedItems.push(this.item.items[i]);
        }
        this.pageItems = selectedItems;

        if (routerChange) {
          if (pageNumber == 1) {
            this.$router.push("/items/" + this.item.friendlyUrl);
          } else {
            this.$router.push(
              "/items/" + this.item.friendlyUrl + "/pageno/" + pageNumber
            );
          }
        }
      } else {
        this.loadingItems = true;
        var apiUrl =
          this.appConfig.$api_url +
          "/api/artifacts/itemsof/" +
          this.item.id +
          "/" +
          ((this.pageNumber - 1) * this.pageSize).toString() +
          "/21";

        axios({
          method: "GET",
          url: apiUrl,
          data: {},
          headers: { "content-type": "application/json" },
        }).then(
          (result) => {
            this.pageItems = result.data;
            this.loadingItems = false;

            if (routerChange) {
              if (pageNumber == 1) {
                this.$router.push("/items/" + this.item.friendlyUrl);
              } else {
                this.$router.push(
                  "/items/" + this.item.friendlyUrl + "/pageno/" + pageNumber
                );
              }
            }
          },
          (error) => {
            this.loadingItems = false;
            this.errorMsg = axiosErrorHandler.handle(error);
          }
        );
      }
    },
    coverImageClicked() {
      if (this.$route.params.tag != null) {
        this.$router.push("/items/" + this.item.friendlyUrl);
      } else {
        this.pageNumber = 1;
        this.pageNumberChanged(1);
      }
    },
    userLoggedIn(userInfo) {
      this.userInfo = userInfo;
    },
    userLoggedOut() {
      this.userInfo = null;
    },
    onEditNameOKClicked() {
      this.item.name = this.itemName;
      this.item.friendlyUrl = this.itemUrl;
      this.item.status = this.itemStatus.value;

      this.errorMsg = "";
      this.longProcessInDialogs = true;
      axios({
        method: "PUT",
        url: this.appConfig.$api_url + "/api/artifacts/" + this.item.id,
        data: this.item,
        headers: {
          authorization: "bearer " + this.userInfo.token,
          "content-type": "application/json",
        },
      }).then(
        () => {
          this.editingName = false;
          this.longProcessInDialogs = false;
        },
        (error) => {
          this.editingName = false;
          this.longProcessInDialogs = false;
          this.errorMsg = axiosErrorHandler.handle(error);
        }
      );
    },
    onGanjoorLinkingClicked() {
      if (this.ganjoorCatId.toString() == "0") {
        this.errorMsg = "بخش انتخاب نشده است.";
        return;
      }

      if (
        !confirm(
          "از تعیین این نسخه به عنوان متن گنجور برای بخش انتخاب شده اطمینان دارید؟"
        )
      ) {
        return;
      }

      this.errorMsg = "";
      this.longProcessInDialogs = true;
      axios({
        method: "PUT",
        url:
          this.appConfig.$api_url +
          "/api/artifacts/ganjoorlink/settextorigin/" +
          this.ganjoorCatId.toString() +
          "/" +
          this.item.id,
        data: null,
        headers: {
          authorization: "bearer " + this.userInfo.token,
          "content-type": "application/json",
        },
      }).then(
        () => {
          this.ganjoorLinking = false;
          this.longProcessInDialogs = false;
        },
        (error) => {
          this.ganjoorLinking = false;
          this.longProcessInDialogs = false;
          this.errorMsg = axiosErrorHandler.handle(error);
        }
      );
    },
    onEditDescriptionOKClicked() {
      this.item.description = this.itemDescription.replace(/\r?\n/g, "<br/>");
      this.errorMsg = "";
      this.longProcessInDialogs = true;
      axios({
        method: "PUT",
        url: this.appConfig.$api_url + "/api/artifacts/" + this.item.id,
        data: this.item,
        headers: {
          authorization: "bearer " + this.userInfo.token,
          "content-type": "application/json",
        },
      }).then(
        () => {
          this.longProcessInDialogs = false;
          this.editingDescription = false;
        },
        (error) => {
          this.longProcessInDialogs = false;
          this.editingDescription = false;
          this.errorMsg = axiosErrorHandler.handle(error);
        }
      );
    },
    addTag(rTag) {
      this.tagObject = rTag;
      this.tagName = "";
      this.errorMsg = "";
      axios({
        method: "GET",
        url: this.appConfig.$api_url + "/api/artifacts/tag",
        data: {},
        headers: {
          "content-type": "application/json",
        },
      }).then(
        (result) => {
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
        },
        (error) => {
          this.errorMsg = axiosErrorHandler.handle(error);
        }
      );
    },
    onAddTagOKClicked() {
      if (this.addPredefinedTag) {
        this.addTagValue(this.newTag);
      } else {
        this.longProcessInDialogs = true;
        axios({
          method: "POST",
          url: this.appConfig.$api_url + "/api/artifacts/tag",
          data: {
            name: this.tagName,
          },
          headers: {
            authorization: "bearer " + this.userInfo.token,
            "content-type": "application/json",
          },
        }).then(
          (result) => {
            this.longProcessInDialogs = false;
            this.addTagValue(result.data);
          },
          (error) => {
            this.longProcessInDialogs = false;
            this.errorMsg = axiosErrorHandler.handle(error);
          }
        );
      }
    },
    addTagValue(rTag) {
      this.longProcessInDialogs = true;
      axios({
        method: "POST",
        url:
          this.appConfig.$api_url + "/api/artifacts/tagvalue/" + this.item.id,
        data: rTag,
        headers: {
          authorization: "bearer " + this.userInfo.token,
          "content-type": "application/json",
        },
      }).then(
        () => {
          this.longProcessInDialogs = false;
          this.addingTagType = false;
          this.loadArtifact();
        },
        (error) => {
          this.longProcessInDialogs = false;
          this.errorMsg = axiosErrorHandler.handle(error);
        }
      );
    },
    editTag(rTag) {
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
    moveTag(tag, upOrDown) {
      this.errorMsg = "";
      axios({
        method: "PUT",
        url:
          this.appConfig.$api_url +
          "/api/artifacts/tag/move/" +
          tag.id +
          "/in/" +
          this.item.id +
          "/" +
          upOrDown,
        data: {},
        headers: {
          authorization: "bearer " + this.userInfo.token,
          "content-type": "application/json",
        },
      }).then(
        () => {
          this.loadArtifact();
        },
        (error) => {
          this.errorMsg = axiosErrorHandler.handle(error);
        }
      );
    },
    removeTagValue(value) {
      if (confirm("از حذف این مقدار ویژگی اطمینان دارید؟")) {
        this.errorMsg = "";
        axios({
          method: "DELETE",
          url:
            this.appConfig.$api_url +
            "/api/artifacts/tagvalue/" +
            this.item.id +
            "/" +
            value.id,
          data: {},
          headers: {
            authorization: "bearer " + this.userInfo.token,
            "content-type": "application/json",
          },
        }).then(
          () => {
            this.loadArtifact();
          },
          (error) => {
            this.errorMsg = axiosErrorHandler.handle(error);
          }
        );
      }
    },
    moveValue(value, upOrDown) {
      this.errorMsg = "";
      axios({
        method: "PUT",
        url:
          this.appConfig.$api_url +
          "/api/artifacts/tagvalue/" +
          this.item.id +
          "/" +
          value.rTagId +
          "/" +
          value.id +
          "/move/" +
          upOrDown,
        data: {},
        headers: {
          authorization: "bearer " + this.userInfo.token,
          "content-type": "application/json",
        },
      }).then(
        () => {
          this.loadArtifact();
        },
        (error) => {
          this.errorMsg = axiosErrorHandler.handle(error);
        }
      );
    },
    onEditTagOKClicked() {
      this.tagObject.name = this.tagName;
      this.tagObject.pluralName = this.tagPlural;
      this.tagObject.friendlyUrl = this.tagUrl;
      this.tagObject.tagType = this.tagType.value;
      this.tagObject.globalValue = this.tagValueEditGlobally;

      this.errorMsg = "";
      this.longProcessInDialogs = true;
      axios({
        method: "PUT",
        url:
          this.appConfig.$api_url + "/api/artifacts/tag/" + this.tagObject.id,
        data: this.tagObject,
        headers: {
          authorization: "bearer " + this.userInfo.token,
          "content-type": "application/json",
        },
      }).then(
        () => {
          this.longProcessInDialogs = false;
          this.editingTagType = false;
        },
        (error) => {
          this.longProcessInDialogs = false;
          this.editingTagType = false;
          this.errorMsg = axiosErrorHandler.handle(error);
        }
      );
    },
    editTagValue(rTagValue, rTag) {
      this.tagValueObject = rTagValue;
      this.tagValue = strReplacer.replaceArray(
        this.tagValueObject.value,
        ["<br>", "<br/>", "<br />"],
        "\r\n"
      );
      this.tagValueUrl = this.tagValueObject.friendlyUrl;
      this.tagValueLink = this.tagValueObject.valueSupplement;

      this.tagValueEditGlobally = rTag.globalValue;

      this.editingTagValue = true;
    },
    onEditTagValueOKClicked() {
      this.tagValueObject.value = this.tagValue.replace("\r\n", "<br/>");
      this.tagValueObject.friendlyUrl = this.tagValueUrl;
      this.tagValueObject.valueSupplement = this.tagValueLink;

      this.errorMsg = "";
      this.longProcessInDialogs = true;
      axios({
        method: "PUT",
        url:
          this.appConfig.$api_url +
          "/api/artifacts/tagvalue/" +
          this.item.id +
          "/" +
          this.tagValueEditGlobally.toString(),
        data: this.tagValueObject,
        headers: {
          authorization: "bearer " + this.userInfo.token,
          "content-type": "application/json",
        },
      }).then(
        () => {
          this.longProcessInDialogs = false;
          this.editingTagValue = false;
        },
        (error) => {
          this.longProcessInDialogs = false;
          this.editingTagValue = false;
          this.errorMsg = axiosErrorHandler.handle(error);
        }
      );
    },
    getFormattedValue(rTagValue, rTag) {
      switch (rTag.tagType) {
        case 2: //Search
        case 3: //SearchLink
          return (
            '<a href="/tags/' +
            rTag.friendlyUrl +
            "/" +
            rTagValue.friendlyUrl +
            '">' +
            rTagValue.value +
            "</a>"
          );
      }
      return rTagValue.value; //Ordinary + Link
    },
    checkPermission(secShortName, opShortName) {
      return PermissionChecker.check(this.userInfo, secShortName, opShortName);
    },
    bookmark() {
      this.errorMsg = "";
      if (this.bookmarked) {
        axios({
          method: "DELETE",
          url:
            this.appConfig.$api_url +
            "/api/artifacts/bookmark/" +
            this.bookmarkId,
          data: {},
          headers: {
            authorization: "bearer " + this.userInfo.token,
            "content-type": "application/json",
          },
        }).then(
          () => {
            this.bookmarked = false;
            this.bookmarkId = "";
          },
          (error) => {
            this.errorMsg = axiosErrorHandler.handle(error);
          }
        );
      } else {
        axios({
          method: "POST",
          url:
            this.appConfig.$api_url + "/api/artifacts/bookmark/" + this.item.id,
          data: {},
          headers: {
            authorization: "bearer " + this.userInfo.token,
            "content-type": "application/json",
          },
        }).then(
          (result) => {
            this.bookmarked = true;
            this.bookmarkId = result.data.id;
          },
          (error) => {
            this.errorMsg = axiosErrorHandler.handle(error);
          }
        );
      }
    },
    getbookmarkIcon() {
      return this.bookmarked ? "star" : "star_border";
    },
    getbookmarkTooltip() {
      return this.bookmarked ? "حذف نشان" : "نشان کردن";
    },
    saveNewNote(noteType) {
      if (this.userInfo == null) {
        return;
      }
      this.errorMsg = "";
      if (this.newNote === "") {
        this.errorMsg = "متن یادداشت خالی است!";
        return;
      }

      var noteTypeCode = 0;
      if (noteType === "public") {
        noteTypeCode = 1;
      }

      axios({
        method: "POST",
        url: this.appConfig.$api_url + "/api/artifacts/note",
        data: {
          entityId: this.item.id,
          noteType: noteTypeCode,
          contents: this.newNote.replace(/\r?\n/g, "<br/>"),
        },
        headers: {
          authorization: "bearer " + this.userInfo.token,
          "content-type": "application/json",
        },
      }).then(
        (result) => {
          if (noteType === "private") {
            this.mynotes.push(result.data);
          } else {
            this.publicnotes.push(result.data);
          }

          this.newNote = "";
          this.writingPrivateNote = false;
          this.writingPublicNote = false;
        },
        (error) => {
          this.errorMsg = axiosErrorHandler.handle(error);
        }
      );
    },
    deleteNote(note) {
      if (confirm("از حذف این یادداشت اطمینان دارید؟")) {
        this.errorMsg = "";
        axios({
          method: "DELETE",
          url: this.appConfig.$api_url + "/api/artifacts/note/" + note.id,
          data: {},
          headers: {
            authorization: "bearer " + this.userInfo.token,
            "content-type": "application/json",
          },
        }).then(
          () => {
            if (note.noteType == 0) {
              this.mynotes = this.mynotes.filter(function (value) {
                return value != note;
              });
            } else {
              this.publicnotes = this.publicnotes.filter(function (value) {
                return value != note;
              });
            }
          },
          (error) => {
            this.errorMsg = axiosErrorHandler.handle(error);
          }
        );
      }
    },
    editCurrentNote(note, noteType) {
      if (this.writingPrivateNote || this.writingPublicNote) {
        this.errorMsg = "لطفا پس از تکمیل عملیات قبلی مجددا تلاش کنید.";
        return;
      }
      this.newNote = strReplacer.replaceArray(
        note.htmlContent,
        ["<br>", "<br/>", "<br />"],
        "\r\n"
      );
      this.editNote = note;
      this.editingPrivateNote = noteType === "private";
      this.editingPublicNote = noteType === "public";
    },
    onEditNoteOKClicked() {
      this.errorMsg = "";
      if (this.newNote === "") {
        this.errorMsg = "متن یادداشت خالی است!";
        return;
      }
      this.longProcessInDialogs = true;
      axios({
        method: "PUT",
        url:
          this.appConfig.$api_url + "/api/artifacts/note/" + this.editNote.id,
        data: {
          entityId: this.item.id,
          noteType: this.editNote.noteType,
          contents: this.newNote.replace(/\r?\n/g, "<br/>"),
        },
        headers: {
          authorization: "bearer " + this.userInfo.token,
          "content-type": "application/json",
        },
      }).then(
        () => {
          this.longProcessInDialogs = false;

          this.editNote.htmlContent = this.newNote.replace(/\r?\n/g, "<br/>");
          this.editingPrivateNote = false;
          this.editingPublicNote = false;
          this.newNote = "";
        },
        (error) => {
          this.longProcessInDialogs = false;
          this.errorMsg = axiosErrorHandler.handle(error);
        }
      );
    },
    publicNoteColor(note) {
      if (note.id === this.hashNoteId) {
        return "#952175";
      }
      return "";
    },
    showCoverImage() {
      if (this.item != null) {
        this.$router.push(
          "/items/" +
            this.item.friendlyUrl +
            "/" +
            this.item.items[this.item.coverItemIndex].friendlyUrl
        );
      }
    },
    deleteArtifact() {
      if (confirm("از حذف این شیء اطمینان دارید؟")) {
        this.errorMsg = "";
        axios({
          method: "DELETE",
          url: this.appConfig.$api_url + "/api/artifacts/" + this.item.id,
          data: {},
          headers: {
            authorization: "bearer " + this.userInfo.token,
            "content-type": "application/json",
          },
        }).then(
          () => {
            alert("حذف انجام شد. لطفا صفحه را رفرش کنید.");
          },
          (error) => {
            this.errorMsg = axiosErrorHandler.handle(error);
          }
        );
      }
    },
  },
  watch: {
    //https://stackoverflow.com/a/41298520/66657
    $route() {
      this.loadArtifact();
    },
  },
};
</script>

<style scoped>
.coverImage {
  margin: auto;
}
.centeredimg {
  margin: auto;
}
.clickable {
  cursor: pointer;
}
.btnedttagvalue {
  width: 20px;
}
.ltrvalue {
  direction: ltr;
}
</style>