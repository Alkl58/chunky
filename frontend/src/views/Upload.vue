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
      <div class="container">
        <input type="text" v-model="password" placeholder="Bucket Password (optional)" class="text-input" />
      </div>

      <div v-if="filesToUpload.length" class="container">
        <div class="progress-container" style="display: contents;">
          <progress :value="totalUploaded" :max="totalSize" style="width: 50%;"></progress>
          <span>{{ formatUploaded(totalUploaded) }} / {{ formatSize(totalSize) }}</span>
        </div>
      </div>

      <div v-if="filesToUpload.length">
        <ul>
          <li v-for="file in filesToUpload" :key="file.name"
            :class="{ 'uploaded': fileProgress.get(file.name) === 100, 'file': true, 'fileError': fileErrors.includes(file.name) }"
            v-show="fileErrors.includes(file.name) || (filesToUpload.length < 6 || (filesToUpload.length >= 6 && fileProgress.get(file.name) !== file.size))">
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

      const bucketData = await this.getBucketId();
      const bucketId = bucketData['bucketId'];
      const bucketToken = bucketData['token'];

      this.filesToUpload.forEach(file => {
        const upload = new tus.Upload(file, {
          endpoint: "/api/upload",
          retryDelays: [0, 1000, 3000, 5000],
          chunkSize: 2 * 1024 * 1024,
          metadata: {
            filename: file.name,
            filetype: file.type,
            bucketId: bucketId,
            ...(this.password !== null && { password: this.password }),
          },
          headers: {
            "token": bucketToken
          },
          onError: (error) => {
            console.error("Upload failed:", error);
            this.error = error.message;
            this.uploading = false;
            this.fileErrors.push(file.name);
          },
          onProgress: (bytesUploaded, bytesTotal) => {
            this.fileProgress.set(file.name, bytesUploaded);
            
            this.totalUploaded = 0;
            this.fileProgress.forEach((value, key) => {
              this.totalUploaded += value;
            });

            this.$forceUpdate();
          },
          onSuccess: () => {
            this.completedUploads++;
            if (this.completedUploads === this.filesToUpload.length) {
              this.uploading = false;
              this.bucketUrl = `/bucket/${bucketId}`;
            }
          },
        });
        upload.start();
      });
    },
  },
};
</script>

<style>
@media (prefers-color-scheme: dark) {
  .text-input {
    background: #1d1d1d !important;
    color: white;
  }
  progress {
    background: #121212 !important;
  }
  progress::-webkit-progress-bar {
    background-color: #121212 !important;
  }
}

.text-input {
  border-radius: 5px;
  border-top: 0px;
  border-left: 0px;
  border-right: 0px;
  border-color: dodgerblue;
  padding: 5px;
  width: 40%;
  background: #e8e8e8;
}

.text-input:hover {
  border-color: rgb(70, 163, 255);
}

.message {
  display: flex;
  align-items: center;
}

.message-message {
  width: 100%;
}

.uploaded {
  border: 1px solid #29b586;
}

.fileError {
  border: 1px solid #b52929;
}

.center {
  text-align: center;
}

.container {
  margin: 20px auto;
}

.file {
  list-style: none;
  padding: 10px;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

progress {
  width: 80%;
  height: 10px;
  border-radius: 5px;
  background: #e8e8e8;
  border-color: transparent;
}

progress::-webkit-progress-bar {
  background-color: #e8e8e8;
  border-color: transparent;
  border-radius: 5px;
}

progress::-webkit-progress-value {
  background-color: #29b586;
  border-radius: 5px;
}

progress::-moz-progress-bar {
  background-color: #29b586;
  border-radius: 5px;
}
</style>
