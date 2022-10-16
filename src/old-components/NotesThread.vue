<template>
  <div class="notes-thread">
    <v-treeview
      :items="publicnotes"
      activatable
      item-key="id"
      item-text="userName"
    >
      <template v-slot:prepend="{ item }">
        <v-flex xs12>
          <v-card :color="publicNoteColor(item)">
            <v-card-text>
              <small><a :name="`${item.id}`" :href="`#${item.id}`">#</a></small>
            </v-card-text>
            <v-card-text>
              <v-icon
                v-if="item.rUserImageId == null"
                size="60"
                class="centeredimg"
                >account_circle</v-icon
              >
              <v-img
                v-if="item.rUserImageId != null"
                max-width="60"
                max-height="60"
                class="centeredimg"
                :src="`${appConfig.$api_url}/api/rimages/${item.rUserImageId}.jpg`"
              ></v-img>
              <br />
              <small>{{ item.userName }}</small>
            </v-card-text>

            <v-card-text v-html="item.htmlContent"></v-card-text>
            <v-card-actions>
              <small v-html="item.dateTime"></small>
              <v-spacer></v-spacer>
              <v-tooltip
                v-if="userInfo != null && userInfo.user.id === item.rAppUserId"
                bottom
              >
                <template v-slot:activator="{ on }">
                  <v-btn
                    text
                    icon
                    color="blue"
                    v-on="on"
                    v-on:click="editCurrentNote(item, 'public')"
                  >
                    <v-icon>edit</v-icon>
                  </v-btn>
                </template>
                <span>اصلاح</span>
              </v-tooltip>
              <!-- edit item begin -->
              <v-layout justify-center v-if="editingPublicNote">
                <v-dialog v-model="editingPublicNote" width="500">
                  <v-card>
                    <v-textarea
                      v-model="newNote"
                      auto-grow
                      outlined
                      rounded
                    ></v-textarea>

                    <v-divider></v-divider>

                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="primary" @click="onEditNoteOKClicked()"
                        >تأیید</v-btn
                      >
                      <v-btn
                        color="secondary"
                        text
                        @click="editingPublicNote = false"
                        >انصراف</v-btn
                      >
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-layout>
              <!-- edit item end -->
              <v-tooltip
                v-if="
                  userInfo != null &&
                  (userInfo.user.id === item.rAppUserId ||
                    checkPermission('note', 'moderate'))
                "
                bottom
              >
                <template v-slot:activator="{ on }">
                  <v-btn
                    text
                    icon
                    color="red"
                    v-on="on"
                    v-on:click="deleteNote(item)"
                  >
                    <v-icon>delete</v-icon>
                  </v-btn>
                </template>
                <span>حذف</span>
              </v-tooltip>
              <v-tooltip v-if="userInfo != null" bottom>
                <template v-slot:activator="{ on }">
                  <v-btn
                    text
                    icon
                    color="green"
                    v-on="on"
                    v-on:click="replyingTo = item.id"
                  >
                    <v-icon>reply</v-icon>
                  </v-btn>
                </template>
                <span>نوشتن پاسخ</span>
              </v-tooltip>
              <v-tooltip v-if="userInfo != null" bottom>
                <template v-slot:activator="{ on }">
                  <v-btn
                    text
                    icon
                    color="red"
                    v-on="on"
                    v-on:click="flaggingItemId = item.id"
                  >
                    <v-icon>flag</v-icon>
                  </v-btn>
                </template>
                <span>گزارش یادداشت</span>
              </v-tooltip>
            </v-card-actions>
            <NotesThread
              v-if="item.notes.length != 0"
              :entity="entity"
              :notes="item.notes"
              :hashNoteId="hashNoteId"
              :itemId="itemId"
              :level="level + 1"
              :imageId="imageId"
            />
            <v-card-text v-if="replyingTo === item.id">
              <v-card>
                <v-card-text>
                  <v-textarea
                    v-model="newNote"
                    auto-grow
                    outlined
                    rounded
                  ></v-textarea>
                  <v-btn
                    v-if="imageId != null"
                    text
                    v-on:click="insertCroppedImage = true"
                  >
                    درج برش <v-icon>crop</v-icon>
                  </v-btn>
                  <v-btn text v-on:click="saveNewNote('public', item)">
                    ذخیره <v-icon>save</v-icon>
                  </v-btn>
                  <v-btn text v-on:click="replyingTo = ''">
                    انصراف <v-icon>cancel</v-icon>
                  </v-btn>
                  <!-- insert cropped image begin -->
                  <v-layout justify-center v-if="insertCroppedImage">
                    <v-dialog v-model="insertCroppedImage" width="500">
                      <v-card>
                        <cropper
                          classname="cropper"
                          :src="`${appConfig.$api_url}/api/images/thumb/${imageId}.jpg`"
                          :stencil-props="{ aspectRatio: 10 / 12 }"
                          @change="cropperCoordinatesChanged"
                        ></cropper>
                        <v-progress-linear
                          v-if="longProcessInDialogs"
                          indeterminate
                        ></v-progress-linear>
                        <v-divider></v-divider>

                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn color="primary" @click="onCropOKClicked()"
                            >تأیید</v-btn
                          >
                          <v-btn
                            color="secondary"
                            text
                            @click="insertCroppedImage = false"
                            >انصراف</v-btn
                          >
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                  </v-layout>
                  <!-- insert cropped image end -->
                </v-card-text>
              </v-card>
            </v-card-text>
            <v-card-text v-if="flaggingItemId === item.id">
              <v-card>
                <v-card-text>
                  <v-textarea
                    v-model="reportContent"
                    auto-grow
                    outlined
                    rounded
                  ></v-textarea>
                  <v-btn text v-on:click="reportNote(item)">
                    ارسال گزارش <v-icon>flag</v-icon>
                  </v-btn>
                  <v-btn text v-on:click="flaggingItemId = ''">
                    انصراف <v-icon>cancel</v-icon>
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-card-text>
          </v-card>
        </v-flex>
      </template>
    </v-treeview>

    <v-card v-if="userInfo != null && level == 0" dark>
      <v-card-text v-if="!writingPublicNote">
        <v-btn text v-on:click="writingPublicNote = true">
          یادداشت جدید <v-icon>add</v-icon>
        </v-btn>
      </v-card-text>
      <v-card-text v-if="writingPublicNote">
        <v-textarea v-model="newNote" auto-grow outlined rounded></v-textarea>
        <v-btn
          v-if="imageId != null"
          text
          v-on:click="insertCroppedImage = true"
        >
          درج برش <v-icon>crop</v-icon>
        </v-btn>
        <v-btn text v-on:click="saveNewNote('public')">
          ذخیره <v-icon>save</v-icon>
        </v-btn>
        <v-btn text v-on:click="writingPublicNote = false">
          انصراف <v-icon>cancel</v-icon>
        </v-btn>
        <!-- insert cropped image begin -->
        <v-layout justify-center v-if="insertCroppedImage">
          <v-dialog v-model="insertCroppedImage" width="500">
            <v-card>
              <cropper
                classname="cropper"
                :src="`${appConfig.$api_url}/api/images/thumb/${imageId}.jpg`"
                :stencil-props="{ aspectRatio: 10 / 12 }"
                @change="cropperCoordinatesChanged"
              ></cropper>
              <v-progress-linear
                v-if="longProcessInDialogs"
                indeterminate
              ></v-progress-linear>
              <v-divider></v-divider>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="onCropOKClicked()">تأیید</v-btn>
                <v-btn
                  color="secondary"
                  text
                  @click="insertCroppedImage = false"
                  >انصراف</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-layout>
        <!-- insert cropped image end -->
      </v-card-text>
    </v-card>
    <v-card v-if="userInfo == null && level == 0" dark>
      <v-card-text v-if="!writingPublicNote">
        برای درج یادداشت می‌بایست ابتدا با کلیک روی علامت سه خط موازی منو واقع
        در بالا/سمت راست صفحه ثبت نام کنید یا اگر پیش‌تر ثبت نام کرده‌اید وارد
        سیستم شوید.
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { EventBus } from "./../event-bus";
import PermissionChecker from "./../utilities/PermissionChecker";
import axios from "axios";
import axiosErrorHandler from "./../utilities/axiosErrorHandler";
import strReplacer from "./../utilities/strReplacer";
import { Cropper } from "vue-advanced-cropper";
const TIMEOUT = 1;

export default {
  name: "NotesThread",
  components: {
    Cropper,
  },
  props: {
    entity: String,
    notes: Array,
    hashNoteId: String,
    itemId: String,
    level: Number,
    imageId: String,
  },
  data() {
    return {
      userInfo: null,
      publicnotes: [],
      writingPublicNote: false,
      editingPublicNote: false,
      newNote: "",
      replyingTo: "",
      flaggingItemId: "",
      reportContent: "",
      longProcessInDialogs: false,
      insertCroppedImage: false,
      coordinates: { width: 0, height: 0, left: 0, top: 0 },
    };
  },
  mounted() {
    this.publicnotes = this.notes;
    if (localStorage.getItem("userInfo")) {
      try {
        this.userInfo = JSON.parse(localStorage.getItem("userInfo"));
      } catch (e) {
        this.userInfo = null;
      }
    }

    EventBus.$on("user-logged-in", this.userLoggedIn);
    EventBus.$on("user-logged-out", this.userLoggedOut);

    if (this.hashNoteId != "") {
      setTimeout(() => this.scrollTo("#" + this.hashNoteId), TIMEOUT);
    } else {
      this.hashNoteId = "";
    }
  },
  methods: {
    userLoggedIn(userInfo) {
      this.userInfo = userInfo;
    },
    userLoggedOut() {
      this.userInfo = null;
    },
    checkPermission(secShortName, opShortName) {
      return PermissionChecker.check(this.userInfo, secShortName, opShortName);
    },
    scrollTo(hashtag) {
      setTimeout(() => {
        location.href = hashtag;
      }, TIMEOUT);
    },
    saveNewNote(noteType, note) {
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

      var postUrl =
        this.entity === "artifact"
          ? this.appConfig.$api_url + "/api/artifacts/note"
          : this.appConfig.$api_url + "/api/artifacts/note/item";
      axios({
        method: "POST",
        url: postUrl,
        data: {
          entityId: this.itemId,
          noteType: noteTypeCode,
          contents: this.newNote.replace(/\r?\n/g, "<br/>"),
          referenceNoteId: note == null ? null : note.id,
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
            if (note == null) {
              this.publicnotes.push(result.data);
            } else {
              note.notes.push(result.data);
            }
          }

          this.newNote = "";
          this.writingPrivateNote = false;
          this.writingPublicNote = false;
          this.replyingTo = "";
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
    reportNote(note) {
      if (this.userInfo == null) {
        return;
      }
      this.errorMsg = "";
      if (this.reportContent === "") {
        this.errorMsg = "لطفا علت گزارش یادداشت را بنویسید!";
        return;
      }

      var postUrl = this.appConfig.$api_url + "/api/artifacts/note/report";
      axios({
        method: "POST",
        url: postUrl,
        data: {
          noteId: note.id,
          reasonText: this.reportContent.replace(/\r?\n/g, "<br/>"),
        },
        headers: {
          authorization: "bearer " + this.userInfo.token,
          "content-type": "application/json",
        },
      }).then(
        () => {
          this.flaggingItemId = "";
          alert("گزارش ارسال شد.");
        },
        (error) => {
          this.errorMsg = axiosErrorHandler.handle(error);
        }
      );
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

      axios({
        method: "PUT",
        url:
          this.appConfig.$api_url + "/api/artifacts/note/" + this.editNote.id,
        data: {
          entityId: this.itemId,
          noteType: this.editNote.noteType,
          contents: this.newNote.replace(/\r?\n/g, "<br/>"),
        },
        headers: {
          authorization: "bearer " + this.userInfo.token,
          "content-type": "application/json",
        },
      }).then(
        () => {
          this.editNote.htmlContent = this.newNote.replace(/\r?\n/g, "<br/>");
          this.editingPrivateNote = false;
          this.editingPublicNote = false;
          this.newNote = "";
        },
        (error) => {
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
    cropperCoordinatesChanged({ coordinates }) {
      this.coordinates = coordinates;
    },
    onCropOKClicked() {
      this.longProcessInDialogs = true;
      axios({
        method: "GET",
        url:
          this.appConfig.$api_url +
          "/api/images/cropped/" +
          this.imageId +
          "?left=" +
          this.coordinates.left +
          "&top=" +
          this.coordinates.top +
          "&width=" +
          this.coordinates.width +
          "&height=" +
          this.coordinates.height,
        data: {},
        headers: {
          authorization: "bearer " + this.userInfo.token,
          "content-type": "application/json",
        },
      }).then(
        (result) => {
          this.newNote += "\r\n";
          this.newNote += '<img src="';
          this.newNote += this.appConfig.$api_url + "/api/rimages/";
          this.newNote += result.data.id;
          this.newNote += '.jpg" alt = "برش تصویر" />';

          this.insertCroppedImage = false;
          this.longProcessInDialogs = false;
        },
        (error) => {
          this.insertCroppedImage = false;
          this.longProcessInDialogs = false;
          this.errorMsg = axiosErrorHandler.handle(error);
        }
      );
    },
  },
};
</script>

<style scoped>
</style>