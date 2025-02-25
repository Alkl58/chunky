<template>
  <div class="flex h-screen dark:bg-neutral-900 dark:text-white">
    <div class="m-auto w-[100%] sm:w-[80%] md:w-[50%] lg:w-[40%] xl:w-[30%] 2xl:w-[25%]">
      <!-- Branding -->
      <div class="flex justify-center pb-4">
        <div class="text-center">
          <div class="flex justify-center">
            <img src="/favicon.png">
          </div>
          <h1 class="text-4xl font-semibold">chunky</h1>
          <h2 class="text-2xl font-medium">A easy file share</h2>
        </div>
      </div>

      <LoadingMessage :message="loadingMessage" />
      <ErrorMessage v-for="(error, index) in errors" :key="index" :message="error" />

      <div v-if="authRequired" class="grid grid-rows-2 gap-4 pt-2">
        <div class="flex">
          <span
            class="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-e-0 border-gray-300 border-e-0 rounded-s-md dark:bg-neutral-600 dark:text-neutral-300 dark:border-neutral-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              class="icon icon-tabler icons-tabler-outline icon-tabler-lock">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z" />
              <path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" />
              <path d="M8 11v-4a4 4 0 1 1 8 0v4" />
            </svg>
          </span>
          <input v-model="uploadPassword" type="text" id="bucket-password"
            class="rounded-none rounded-e-lg bg-gray-50 border text-gray-900 focus:ring-pink-500 focus:border-pink-500 block flex-1 min-w-0 w-full text-sm border-neutral-300 p-2.5 dark:bg-neutral-700 dark:border-neutral-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-pink-500 dark:focus:border-pink-500"
            :placeholder="$t('password') " />
        </div>
        <button
          class="font-medium w-full text-base px-4 bg-pink-400 hover:bg-pink-500 disabled:bg-neutral-700 cursor-pointer text-white rounded min-h-[44px]"
          @click="fetchConfig">{{ $t('submit') }}</button>
      </div>

      <!-- Success -->
      <div v-if="bucketUrl" class="flex rounded bg-lime-500 text-lime-900 min-h-[48px] mb-4">
        <div class="self-center p-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="icon icon-tabler icons-tabler-outline icon-tabler-check">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M5 12l5 5l10 -10" />
          </svg>
        </div>
        <p class="self-center">{{ $t('uploadSuccess') }} <a :href="bucketUrl" target="_blank">{{ bucketUrl }}</a></p>
      </div>

      <!-- Progress -->
      <div v-if="uploading" class="flex rounded bg-amber-400 text-amber-900 min-h-[48px] mb-4">
        <div class="self-center p-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="icon icon-tabler icons-tabler-outline icon-tabler-loader-2 animate-spin">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 3a9 9 0 1 0 9 9" />
          </svg>
        </div>
        <p class="self-center">{{ $t('uploadInProgress') }} {{ (totalUploaded / totalSize * 100 || 0).toFixed(2) }}%</p>
      </div>

      <!-- File Input -->
      <div v-if="config && !authRequired" class="flex flex-col sm:flex-row gap-2">
        <input
          class="w-full text-gray-500 dark:text-white font-medium text-base bg-gray-100 dark:bg-neutral-700 file:cursor-pointer cursor-pointer file:border-0 file:py-2.5 file:px-4 file:mr-4 file:bg-pink-400 file:hover:bg-pink-500 file:text-white rounded"
          type="file" @change="addFilesToList" multiple />
        <button
          class="font-medium text-base px-4 bg-pink-400 hover:bg-pink-500 disabled:bg-neutral-700 cursor-pointer text-white rounded min-h-[44px]"
          @click="uploadFiles" :disabled="uploading || bucketUrl || filesToUpload.length == 0">
          Upload
        </button>
      </div>

      <!-- Settings -->
      <div v-if="config && !authRequired" class="flex justify-center pt-2">
        <button class="flex content-center" @click="showSettings = !showSettings">
          {{ $t('settings') }}
          <span v-if="showSettings" class="self-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"
              class="icon icon-tabler icons-tabler-filled icon-tabler-caret-up">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path
                d="M11.293 7.293a1 1 0 0 1 1.32 -.083l.094 .083l6 6l.083 .094l.054 .077l.054 .096l.017 .036l.027 .067l.032 .108l.01 .053l.01 .06l.004 .057l.002 .059l-.002 .059l-.005 .058l-.009 .06l-.01 .052l-.032 .108l-.027 .067l-.07 .132l-.065 .09l-.073 .081l-.094 .083l-.077 .054l-.096 .054l-.036 .017l-.067 .027l-.108 .032l-.053 .01l-.06 .01l-.057 .004l-.059 .002h-12c-.852 0 -1.297 -.986 -.783 -1.623l.076 -.084l6 -6z" />
            </svg>
          </span>
          <span v-else class="self-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"
              class="icon icon-tabler icons-tabler-filled icon-tabler-caret-down">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path
                d="M18 9c.852 0 1.297 .986 .783 1.623l-.076 .084l-6 6a1 1 0 0 1 -1.32 .083l-.094 -.083l-6 -6l-.083 -.094l-.054 -.077l-.054 -.096l-.017 -.036l-.027 -.067l-.032 -.108l-.01 -.053l-.01 -.06l-.004 -.057v-.118l.005 -.058l.009 -.06l.01 -.052l.032 -.108l.027 -.067l.07 -.132l.065 -.09l.073 -.081l.094 -.083l.077 -.054l.096 -.054l.036 -.017l.067 -.027l.108 -.032l.053 -.01l.06 -.01l.057 -.004l12.059 -.002z" />
            </svg>
          </span>
        </button>
      </div>
      <div v-if="config && !authRequired" v-show="showSettings"
        class="grid grid-rows-2 md:grid-cols-2 md:grid-rows-1 gap-2 bg-gray-100 dark:bg-neutral-800 p-2 mt-1 rounded">
        <!-- Bucket password -->
        <div>
          <label for="bucket-password" class="block mb-2 font-medium text-gray-900 dark:text-white">{{ $t('password')
            }}</label>
          <div class="flex">
            <span
              class="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-e-0 border-gray-300 border-e-0 rounded-s-md dark:bg-neutral-600 dark:text-neutral-300 dark:border-neutral-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                class="icon icon-tabler icons-tabler-outline icon-tabler-lock">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z" />
                <path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" />
                <path d="M8 11v-4a4 4 0 1 1 8 0v4" />
              </svg>
            </span>
            <input v-model="password" type="text" id="bucket-password"
              class="rounded-none rounded-e-lg bg-gray-50 border h-[42px] text-gray-900 focus:ring-pink-500 focus:border-pink-500 block flex-1 min-w-0 w-full text-sm border-neutral-300 p-2.5 dark:bg-neutral-700 dark:border-neutral-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-pink-500 dark:focus:border-pink-500"
              :placeholder="$t('optional')">
          </div>
        </div>

        <!-- Expiration -->
        <div>
          <label for="bucket-expiration" class="block mb-2 font-medium text-gray-900 dark:text-white">{{
            $t('expiration') }}</label>
          <div class="flex">
            <span
              class="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-e-0 border-gray-300 border-e-0 rounded-s-md dark:bg-neutral-600 dark:text-neutral-300 dark:border-neutral-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                class="icon icon-tabler icons-tabler-outline icon-tabler-clock">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
                <path d="M12 7v5l3 3" />
              </svg>
            </span>
            <select v-model="expirationTime" id="bucket-expiration"
              class="bg-gray-50 border h-[42px] border-gray-300 text-gray-900 text-sm rounded-e-lg border-s-gray-100 dark:border-s-neutral-700 border-s-2 focus:ring-pink-500 focus:border-pink-500 block w-full p-2.5 dark:bg-neutral-700 dark:border-neutral-600 dark:placeholder-neutral-400 dark:text-white dark:focus:ring-pink-500 dark:focus:border-pink-500">
              <option v-for="expiration in config.BUCKET_EXPIRATION" :key="expiration" :value="expiration"
                :selected="expiration === config.BUCKET_EXPIRATION_DEFAULT">
                <span v-if="/[hdwm]$/.test(expiration)">
                  {{ $t(`expirations.${getExpirationUnit(expiration)}`, getExpirationValue(expiration)) }}
                </span>
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- File List -->
      <div v-if="filesToUpload.length && totalUploaded != totalSize">
        <div class="w-full text-end">
          <span>Total: {{ formatUploaded(totalUploaded) }} / {{ formatSize(totalSize) }}</span>
        </div>

        <div v-for="file in filesToUpload" :key="file.name"
          class="w-full grid gap-1 mb-1 rounded bg-gray-100 dark:bg-neutral-800 p-2"
          v-show="fileErrors.includes(file.name) || fileProgress.get(file.name) !== file.size">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <div class="grid gap-1">
                <h4 class="text-sm font-semibold leading-snug break-all">{{ file.name }} <small>({{
                    formatSize(file.size)
                    }})</small></h4>
              </div>
            </div>
            <!-- To-Do: Add Delete Button -->
          </div>
          <!-- Progressbar -->
          <div class="relative flex items-center gap-2.5">
            <div class="relative w-full h-2.5  overflow-hidden rounded-3xl bg-neutral-300 dark:bg-neutral-900">
              <div role="progressbar" :aria-valuenow="`${fileProgress.get(file.name)}`" aria-valuemin="0"
                :aria-valuemax="`${fileProgress.get(file.name)}`"
                :style="`width: ${fileProgress.get(file.name) / file.size * 100}%`"
                class="flex h-full items-center justify-center bg-pink-400  text-white rounded-3xl">
              </div>
            </div>
            <span class="ml-2 rounded-full text-xs font-medium flex justify-center items-center ">{{
              (fileProgress.get(file.name) / file.size * 100 || 0).toFixed(2) }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as tus from 'tus-js-client';
import ErrorMessage from './components/ErrorMessage.vue';
import LoadingMessage from './components/LoadingMessage.vue';

export default {
  components: {
    ErrorMessage,
    LoadingMessage
  },
  data() {
    return {
      authRequired: false,
      uploadPassword: null,
      uploading: false,
      filesToUpload: [],
      completedUploads: 0,
      bucketUrl: null,
      errors: [],
      fileProgress: new Map(),
      fileErrors: [],
      totalSize: 0,
      totalUploaded: 0,
      password: null,
      showSettings: false,
      expirationTime: '4w',
      loadingMessage: null,
      config: null,
    };
  },
  methods: {
    fetchConfig() {
      this.loadingMessage = 'Fetching configuration...';
      this.authRequired = false;
      this.errors = [];

      const passwordHeader = new Headers();
      console.log("PW: " + this.uploadPassword);
      if (this.uploadPassword) {
        passwordHeader.append("chunky-auth", this.uploadPassword);
      }

      fetch('/api/config', { headers: passwordHeader })
        .then(response => {
          if (!response.ok) {
            throw new Error("Error fetching config: Network response was not ok");
          }
          return response.json();
        })
        .then(data => {
          // Handle cases where the API might return an error string instead of an object
          if (typeof data === "string") {
            if (data == "Password required!") {
              this.authRequired = true;
              this.errors.push(this.$t('passwordRequired'));
            } else {
              this.errors.push(data);
            }
          } else {
            this.config = data;
          }
        })
        .catch(err => {
          this.errors.push(err.message || "An error occurred while fetching the config data.");
        })
        .finally(() => {
          this.loadingMessage = null;
        });
    },
    getExpirationValue(value) {
      const match = value.match(/^(\d+)([hdwm])$/);
      if (!match) return value; // fallback in case of unexpected format

      const amount = parseInt(match[1], 10);
      return amount;
    },
    getExpirationUnit(expiration) {
      return expiration.slice(-1) === 'h' ? 'hour' :
        expiration.slice(-1) === 'd' ? 'day' :
          expiration.slice(-1) === 'w' ? 'week' :
            'month';
    },
    addFilesToList(event) {
      if (!this.config) return;
      const files = Array.from(event.target.files);
      if (files.length === 0) return;
      this.errors = [];
      this.filesToUpload = [];

      let filesTooBig = 0;
      let bucketTooBig = 0;
      files.forEach(file => {
        if (this.config.MAX_FILE_SIZE !== -1 && this.config.MAX_FILE_SIZE < file.size) {
          console.log("File: " + file.name + " is too big!");
          filesTooBig += 1;
          return;
        }

        if (this.config.MAX_BUCKET_SIZE !== -1 && this.config.MAX_BUCKET_SIZE < this.totalSize + file.size) {
          console.log("Bucket is too big!");
          bucketTooBig += 1;
          return;
        }

        this.filesToUpload.push(file);
        this.fileProgress.set(file.name, 0);
        this.totalSize += file.size;
      });

      if (filesTooBig) {
        this.errors.push(this.$t('errorMaxFileSize', { count: filesTooBig, maxSize: this.formatSize(this.config.MAX_FILE_SIZE) }));
      }

      if (bucketTooBig) {
        this.errors.push(this.$t('errorMaxBucketSize', { count: bucketTooBig, maxSize: this.formatSize(this.config.MAX_BUCKET_SIZE) }));
      }
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
      const passwordHeader = new Headers();
      if (this.uploadPassword) {
        passwordHeader.append("chunky-auth", this.uploadPassword);
      }

      const response = await fetch("/api/get-bucket-token", { headers: passwordHeader });
      const data = await response.json();
      return data;
    },
    async updateBucket(bucketToken, bucketId) {
      const headers = new Headers();
      headers.append('Content-Type', 'application/json');
      if (this.uploadPassword) {
        headers.append('chunky-auth', this.uploadPassword);
      }

      try {
        const response = await fetch('/api/update-bucket', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({ token: bucketToken })
        });

        const data = await response.json();
        if (response.ok) {
          this.uploading = false;
        } else {
          this.errors.push(`Error: ${data.message}`);
        }

        this.bucketUrl = window.location.origin + `/bucket/${bucketId}`;
      } catch (error) {
        this.errors.push('Failed to submit bucket metadata.');
        console.error('Error submitting data:', error);
      }
    },
    async uploadFiles() {
      if (this.filesToUpload.length === 0) return;
      this.uploading = true;
      this.bucketUrl = null;
      this.completedUploads = 0;
      this.fileErrors = [];
      this.totalUploaded = 0;

      const bucketData = await this.getBucketId();
      if (bucketData === 'Password required!') {
        // This should * not * happen
        this.errors.push("This should not have happened! There is some auth issue!");
        return;
      }

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
            this.errors.push(error.message);
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
              this.updateBucket(bucketToken, bucketId);
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
    },
  },
  created() {
    this.fetchConfig();
  },
};
</script>
