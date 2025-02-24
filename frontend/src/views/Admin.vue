<template>
  <div class="flex h-screen dark:bg-neutral-900 dark:text-white">
    <div class="m-auto w-[100%] sm:w-[80%] md:w-[50%] lg:w-[40%] xl:w-[30%] 2xl:w-[20%]">
      <div class="flex justify-center pb-4">
        <div class="text-center">
          <div class="flex justify-center">
            <img src="/favicon.png">
          </div>
          <h2 class="text-2xl font-medium">Admin</h2>
        </div>
      </div>

      <!-- Loading and error states -->
      <LoadingMessage :message="loadingMessage" />
      <ErrorMessage v-for="(error, index) in errors" :key="index" :message="error" />

      <div v-if="authRequired && !adminData" class="grid grid-rows-2 gap-4 pt-2">
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
          @click="fetchAdminData">Submit</button>
      </div>

      <!-- Display buckets once loaded -->
      <div v-if="adminData && !loadingMessage">
        <div v-for="bucket in adminData" class="w-full grid gap-1 mb-1 rounded bg-gray-100 dark:bg-neutral-800 p-2">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <div class="grid gap-1">
                <h4 class="text-sm font-semibold leading-snug break-all">{{ bucket.bucketId }}</h4>
                <h5 class="text-neutral-600 dark:text-neutral-300 text-xs font-normal leading-4">{{
                  formatSize(bucket.bucketSize) }}</h5>
              </div>
            </div>
            <div class="flex gap-1">
              <a class="font-medium p-2 text-base bg-pink-400 hover:bg-pink-500 disabled:bg-neutral-700 cursor-pointer text-white rounded"
                :href="`/bucket/${bucket.bucketId}${bucket.password ? `?p=${bucket.password}` : ''}`" target="_blank">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                  class="icon icon-tabler icons-tabler-outline icon-tabler-folder-open">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path
                    d="M5 19l2.757 -7.351a1 1 0 0 1 .936 -.649h12.307a1 1 0 0 1 .986 1.164l-.996 5.211a2 2 0 0 1 -1.964 1.625h-14.026a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2h4l3 3h7a2 2 0 0 1 2 2v2" />
                </svg></a>
              <button
                class="font-medium p-2 text-base bg-red-400 hover:bg-red-500 disabled:bg-neutral-700 cursor-pointer text-white rounded"
                @click="deleteBucket(bucket.bucketId)">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                  class="icon icon-tabler icons-tabler-outline icon-tabler-trash">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M4 7l16 0" />
                  <path d="M10 11l0 6" />
                  <path d="M14 11l0 6" />
                  <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                  <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="adminData && adminData.length == 0 && !loadingMessage">
        <h2 class="text-neutral-600 dark:text-neutral-300 text-2xl font-normal leading-4 text-center">No buckets</h2>
      </div>
    </div>
  </div>
</template>

<script>
import ErrorMessage from './components/ErrorMessage.vue';
import LoadingMessage from './components/LoadingMessage.vue';

export default {
  name: "Admin",
  components: {
    ErrorMessage,
    LoadingMessage,
  },
  data() {
    return {
      bucketId: this.$route.params.bucketId || null,
      adminData: null,
      loadingMessage: null,
      errors: [],
      authRequired: false,
      password: null,
    };
  },

  methods: {
    async fetchAdminData() {
      this.loadingMessage = 'Loading admin data...';
      this.adminData = null;

      const passwordHeader = new Headers();
      if (this.password) {
        passwordHeader.append("chunky-admin-auth", this.password);
      }

      fetch(`/api/admin`, { headers: passwordHeader })
        .then(response => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then(data => {
          if (typeof data === "string") {
            if (data == "Password required!") {
              this.authRequired = true;
            }
            this.error = data;
          } else {
            this.adminData = data;
            this.error = null;
          }
        })
        .catch(err => {
          this.error = err.message || "An error occurred while fetching the bucket data.";
        })
        .finally(() => {
          this.loadingMessage = null;
        });
    },
    async deleteBucket(bucketId) {

      const headers = new Headers();
      headers.append('Content-Type', 'application/json');
      if (this.password) {
        headers.append('chunky-admin-auth', this.password);
      }

      try {
        const response = await fetch('/api/admin', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({ bucketId: bucketId })
        });

        const data = await response.json();
        if (response.ok) {
          this.fetchAdminData();
        } else {
          this.errors.push(`Error: ${data.message}`);
        }
      } catch (error) {
        this.errors.push('Failed to submit bucket metadata.');
        console.error('Error submitting data:', error);
      }
    },
    formatSize(size) {
      // Convert bytes into a human-readable format
      const i = Math.floor(Math.log(size) / Math.log(1024));
      return (size / Math.pow(1024, i)).toFixed(2) + " " + ["B", "kB", "MB", "GB", "TB"][i];
    }
  },
  created() {
    this.fetchAdminData();
  },
};
</script>
