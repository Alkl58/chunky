<template>
  <div class="center">
    <div class="container">
      <img src="/cloud.png">
      <h1>File Upload</h1>
    </div>

    <div v-if="error" class="message message-error">
      <p>{{ error }}</p>
    </div>
    <div v-if="bucketUrl" class="message">
      <p>All files uploaded!</p>
      <p>Download: <a :href="bucketUrl" target="_blank">{{ bucketUrl }}</a></p>
    </div>
    <input type="file" @change="addFilesToList" multiple />
    <div v-if="filesToUpload">
      <ul>
        <li v-for="file in filesToUpload" :key="file.name" class="file">
          <h2>{{ file.name }}</h2>
          <p>Size: {{ formatSize(file.size) }}</p>
        </li>
      </ul>
      <button class="upload-button" @click="uploadFiles" :disabled="uploading || bucketUrl">
        Upload
      </button>
    </div>

    <div v-if="uploading">
      <progress :value="totalProgress" max="100"></progress>
      <p>{{ totalProgress.toFixed(2) }}%</p>
    </div>
  </div>
</template>

<script>
import * as tus from 'tus-js-client';

export default {
  data() {
    return {
      uploading: false,
      totalProgress: 0,
      filesToUpload: [],
      completedUploads: 0,
      bucketUrl: null,
      error: null,
    };
  },
  methods: {
    addFilesToList(event) {
      const files = Array.from(event.target.files);
      if (files.length === 0) return;
      this.filesToUpload = files;
    },
    formatSize(size) {
      // Convert bytes into a human-readable format
      const i = Math.floor(Math.log(size) / Math.log(1024));
      return (size / Math.pow(1024, i)).toFixed(2) + " " + ["B", "kB", "MB", "GB", "TB"][i];
    },
    async getBucketId() {
      const response = await fetch("/api/generate-bucket");
      const data = await response.json();
      return data;
    },
    async uploadFiles() {
      const files = this.filesToUpload;
      if (files.length === 0) return;

      this.uploading = true;
      this.bucketUrl = null;
      this.completedUploads = 0;

      const totalSize = files.reduce((acc, file) => acc + file.size, 0);
      let uploadedSize = 0;

      const bucketData = await this.getBucketId();
      const bucketId = bucketData['bucketId'];
      const bucketToken = bucketData['token'];
      console.log("Bucked ID   : " + bucketId);
      console.log("Bucked Token: " + bucketToken);

      files.forEach(file => {
        const upload = new tus.Upload(file, {
          endpoint: "/api/upload",
          retryDelays: [0, 1000, 3000, 5000],
          chunkSize: 2 * 1024 * 1024,
          metadata: {
            filename: file.name,
            filetype: file.type,
            bucketId: bucketId,
          },
          headers: {
            "token": bucketToken
          },
          onError: (error) => {
            console.error("Upload failed:", error);
            this.error = error.message;
            this.uploading = false;
          },
          onProgress: (bytesUploaded) => {
            uploadedSize += bytesUploaded - (this.fileProgress.get(file) || 0);
            this.fileProgress.set(file, bytesUploaded);
            this.totalProgress = (uploadedSize / totalSize) * 100;
          },
          onSuccess: () => {
            this.completedUploads++;
            if (this.completedUploads === files.length) {
              this.uploading = false;
              this.bucketUrl = `/bucket/${bucketId}`;
            }
          },
        });
        this.fileProgress.set(file, 0);
        upload.start();
      });
    },
  },
  created() {
    this.fileProgress = new Map();
  },
};
</script>