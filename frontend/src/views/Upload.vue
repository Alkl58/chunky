<template>
  <div class="center">
    <div class="form">
      <div class="container">
        <img src="/cloud.png">
        <h1>File Upload</h1>
      </div>

      <div v-if="error" class="message message-error">
        <p>{{ error }}</p>
      </div>
      <div v-if="bucketUrl" class="message">
        <div>
          <!-- Checkmark Icon -->
          <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="icon icon-tabler icons-tabler-outline icon-tabler-check">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M5 12l5 5l10 -10" />
          </svg>
        </div>
        <div class="message-message">
          <p>All files uploaded!</p>
          <p>Download: <a :href="bucketUrl" target="_blank">{{ bucketUrl }}</a></p>
        </div>
      </div>
      <div class="container">
        <input type="file" @change="addFilesToList" multiple />
        <button class="upload-button" @click="uploadFiles"
          :disabled="uploading || bucketUrl || filesToUpload.length == 0">
          Upload
        </button>
      </div>
      <div>
        <button class="settings-toggle" @click="showSettings = !showSettings">
          Settings
          <span v-if="showSettings">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"
              class="icon icon-tabler icons-tabler-filled icon-tabler-caret-up">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path
                d="M11.293 7.293a1 1 0 0 1 1.32 -.083l.094 .083l6 6l.083 .094l.054 .077l.054 .096l.017 .036l.027 .067l.032 .108l.01 .053l.01 .06l.004 .057l.002 .059l-.002 .059l-.005 .058l-.009 .06l-.01 .052l-.032 .108l-.027 .067l-.07 .132l-.065 .09l-.073 .081l-.094 .083l-.077 .054l-.096 .054l-.036 .017l-.067 .027l-.108 .032l-.053 .01l-.06 .01l-.057 .004l-.059 .002h-12c-.852 0 -1.297 -.986 -.783 -1.623l.076 -.084l6 -6z" />
            </svg>
          </span>
          <span v-else>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"
              class="icon icon-tabler icons-tabler-filled icon-tabler-caret-down">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path
                d="M18 9c.852 0 1.297 .986 .783 1.623l-.076 .084l-6 6a1 1 0 0 1 -1.32 .083l-.094 -.083l-6 -6l-.083 -.094l-.054 -.077l-.054 -.096l-.017 -.036l-.027 -.067l-.032 -.108l-.01 -.053l-.01 -.06l-.004 -.057v-.118l.005 -.058l.009 -.06l.01 -.052l.032 -.108l.027 -.067l.07 -.132l.065 -.09l.073 -.081l.094 -.083l.077 -.054l.096 -.054l.036 -.017l.067 -.027l.108 -.032l.053 -.01l.06 -.01l.057 -.004l12.059 -.002z" />
            </svg>
          </span>
        </button>
        <div v-show="showSettings" class="settings-panel">
          <p>
            Password:
            <input type="text" v-model="password" placeholder="optional" class="text-input" />
          </p>
          <p>
            Expiration:
            <select v-model="expirationTime" class="text-input">
              <option value="1h">1 Hour</option>
              <option value="6h">6 Hours</option>
              <option value="1d">1 Day</option>
              <option value="3d">3 Days</option>
              <option value="1w">1 Week</option>
              <option value="2w">2 Weeks</option>
              <option value="4w">4 Weeks</option>
              <option value="8w">8 Weeks</option>
            </select>
          </p>
        </div>
      </div>
      <div v-if="filesToUpload.length && totalUploaded != totalSize">
        <div v-if="filesToUpload.length" class="container">
          <div class="progress-container" style="display: contents;">
            <progress :value="totalUploaded" :max="totalSize" style="width: 50%;"></progress>
            <span>{{ formatUploaded(totalUploaded) }} / {{ formatSize(totalSize) }}</span>
          </div>
        </div>
        <ul class="upload-list">
          <li v-for="file in filesToUpload" :key="file.name"
            :class="{ 'uploaded': fileProgress.get(file.name) === file.size, 'file': true, 'fileError': fileErrors.includes(file.name) }"
            v-show="fileErrors.includes(file.name) || fileProgress.get(file.name) !== file.size">
            <p style="margin: 0;">{{ file.name }} <small>({{ formatSize(file.size) }})</small></p>
            <div class="progress-container">
              <progress :value="fileProgress.get(file.name) || 0" :max="file.size"></progress>
              <span>{{ (fileProgress.get(file.name) / file.size * 100 || 0).toFixed(2) }}%</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import * as tus from 'tus-js-client';

export default {
  data() {
    return {
      uploading: false,
      filesToUpload: [],
      completedUploads: 0,
      bucketUrl: null,
      error: null,
      fileProgress: new Map(),
      fileErrors: [],
      totalSize: 0,
      totalUploaded: 0,
      password: null,
      showSettings: false,
      expirationTime: '4w',
    };
  },
  methods: {
    addFilesToList(event) {
      const files = Array.from(event.target.files);
      if (files.length === 0) return;
      this.filesToUpload = files;
      files.forEach(file => {
        this.fileProgress.set(file.name, 0);
        this.totalSize += file.size;
      });

    },
    formatSize(size) {
      const i = Math.floor(Math.log(size) / Math.log(1024));
      return (size / Math.pow(1024, i)).toFixed(2) + " " + ["B", "kB", "MB", "GB", "TB"][i];
    },
    formatUploaded(size) {
      if (size == 0) {
        return 0;
      }
      const i = Math.floor(Math.log(size) / Math.log(1024));
      return (size / Math.pow(1024, i)).toFixed(2);
    },
    async getBucketId() {
      const response = await fetch("/api/generate-bucket");
      const data = await response.json();
      return data;
    },
    async uploadFiles() {
      if (this.filesToUpload.length === 0) return;
      this.uploading = true;
      this.bucketUrl = null;
      this.completedUploads = 0;
      this.fileErrors = [];
      this.totalUploaded = 0;

      const bucketData = await this.getBucketId();
      const bucketId = bucketData['bucketId'];
      const bucketToken = bucketData['token'];

      const MAX_PARALLEL_UPLOADS = 4;
      let activeUploads = 0;
      let uploadQueue = [...this.filesToUpload];

      const startNextUpload = () => {
        if (uploadQueue.length === 0 || activeUploads >= MAX_PARALLEL_UPLOADS) return;

        const file = uploadQueue.shift();
        activeUploads++;

        const upload = new tus.Upload(file, {
          endpoint: "/api/upload",
          retryDelays: [0, 1000, 3000, 5000],
          chunkSize: 2 * 1024 * 1024,
          metadata: {
            filename: file.name,
            filetype: file.type,
            bucketId: bucketId,
            ...(this.password !== null && { password: this.password }),
            expiration: this.expirationTime,
          },
          headers: {
            "token": bucketToken
          },
          onError: (error) => {
            console.error("Upload failed:", error);
            this.error = error.message;
            this.fileErrors.push(file.name);
          },
          onProgress: (bytesUploaded) => {
            this.fileProgress.set(file.name, bytesUploaded);
            this.totalUploaded = Array.from(this.fileProgress.values()).reduce((a, b) => a + b, 0);
            this.$forceUpdate();
          },
          onSuccess: () => {
            this.completedUploads++;
            if (this.completedUploads === this.filesToUpload.length) {
              this.uploading = false;
              this.bucketUrl = `/bucket/${bucketId}`;
            }
            activeUploads--;
            startNextUpload(); // Start a new upload after one finishes
          },
        });

        upload.start();
        startNextUpload(); // Ensure up to 4 uploads are running
      };

      // Start initial batch of uploads
      for (let i = 0; i < MAX_PARALLEL_UPLOADS; i++) {
        startNextUpload();
      }
    }

  },
};
</script>
