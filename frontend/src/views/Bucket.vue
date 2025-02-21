<template>
  <div class="flex h-screen dark:bg-neutral-900 dark:text-white">
    <div class="m-auto">
      <div class="flex justify-center pb-4">
        <div class="text-center">
          <div class="flex justify-center">
            <img src="/favicon.png">
          </div>
          <h2 class="text-2xl font-medium">Download</h2>
        </div>
      </div>

      <!-- Loading and error states -->
      <div v-if="loading" class="flex rounded bg-amber-400 text-amber-900 min-h-[48px] mb-4">
        <div class="self-center p-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="icon icon-tabler icons-tabler-outline icon-tabler-loader-2 animate-spin">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 3a9 9 0 1 0 9 9" />
          </svg>
        </div>
        <p class="self-center">Loading bucket data...</p>
      </div>

      <ErrorMessage :message="error" />

      <div v-if="authRequired && !bucketData" class="grid grid-rows-2 gap-4 pt-2">
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
            class="rounded-none rounded-e-lg bg-gray-50 border text-gray-900 focus:ring-pink-500 focus:border-pink-500 block flex-1 min-w-0 w-full text-sm border-neutral-300 p-2.5 dark:bg-neutral-700 dark:border-neutral-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-pink-500 dark:focus:border-pink-500"
            placeholder="Password" />
        </div>
        <button
          class="font-medium w-full text-base px-4 bg-pink-400 hover:bg-pink-500 disabled:bg-neutral-700 cursor-pointer text-white rounded min-h-[44px]"
          @click="fetchBucket">Submit</button>
      </div>

      <!-- Display bucket files once loaded -->
      <div v-if="bucketData && bucketData.files && !loading && !error">
        <div v-for="file in bucketData.files" :key="file.id"
          class="w-full grid gap-1 mb-1 rounded bg-gray-100 dark:bg-neutral-800 p-2">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <div class="grid gap-1">
                <h4 class="text-sm font-semibold leading-snug break-all">{{ file.metadata.filename }}</h4>
                <h5 class="text-neutral-300 text-xs font-normal leading-4">{{ formatSize(file.size) }}</h5>
              </div>
            </div>
            <a class="font-medium p-2 text-base bg-pink-400 hover:bg-pink-500 disabled:bg-neutral-700 cursor-pointer text-white rounded"
              :href="`/download/${bucketId}/${file.id}`" target="_blank" :download="file.metadata.filename">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                class="icon icon-tabler icons-tabler-outline icon-tabler-download">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
                <path d="M7 11l5 5l5 -5" />
                <path d="M12 4l0 12" />
              </svg></a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ErrorMessage from './components/ErrorMessage.vue';

export default {
  name: "Bucket",
  components: {
    ErrorMessage
  },
  data() {
    return {
      bucketId: this.$route.params.bucketId || null,
      bucketData: null,
      loading: true,
      error: null,
      authRequired: false,
      password: null,
    };
  },
  methods: {
    fetchBucket() {
      const passwordHeader = new Headers();
      if (this.password) {
        passwordHeader.append("chunky-bucket-auth", this.password);
      }

      fetch(`/api/bucket/${this.bucketId}`, { headers: passwordHeader })
        .then(response => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then(data => {
          // Handle cases where the API might return an error string instead of an object
          if (typeof data === "string") {
            if (data == "Password required!") {
              this.authRequired = true;
            }
            this.error = data;
          } else {
            this.bucketData = data;
            this.error = null;
          }
        })
        .catch(err => {
          this.error = err.message || "An error occurred while fetching the bucket data.";
        })
        .finally(() => {
          this.loading = false;
        });
    },
    formatSize(size) {
      // Convert bytes into a human-readable format
      const i = Math.floor(Math.log(size) / Math.log(1024));
      return (size / Math.pow(1024, i)).toFixed(2) + " " + ["B", "kB", "MB", "GB", "TB"][i];
    },
  },
  created() {
    this.fetchBucket();
  },
};
</script>
