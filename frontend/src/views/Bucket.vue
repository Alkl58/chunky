<template>
  <div class="center">
    <div class="container">
      <img src="/cloud.png">
      <h1>File Download</h1>
    </div>
    <!-- Loading and error states -->
    <div v-if="loading" class="message">
      <p>Loading bucket data...</p>
    </div>

    <div v-if="error" class="message message-error">
      <p>{{ error }}</p>
    </div>

    <!-- Display bucket files once loaded -->
    <div v-if="bucketData && bucketData.files && !loading && !error">
      <ul>
        <li v-for="file in bucketData.files" :key="file.id" class="file">
          <p>{{ file.metadata.filename }} <small>({{ formatSize(file.size) }})</small></p>
          <div class="download-container">
            <a class="download-button" :href="`/download/${bucketId}/${file.id}`" target="_blank" :download="file.metadata.filename">Download</a>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "Bucket",
  data() {
    return {
      bucketId: this.$route.params.bucketId || null,
      bucketData: null,
      loading: true,
      error: null,
    };
  },
  methods: {
    fetchBucket() {
      fetch(`/api/bucket/${this.bucketId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then(data => {
          // Handle cases where the API might return an error string instead of an object
          if (typeof data === "string") {
            this.error = data;
          } else {
            this.bucketData = data;
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

<style scoped>
.file>p {
  margin-top: 0;
}

.download-container {
  width: 100%;
  text-align: end;
  padding-top: 15px;
}

.download-button {
  padding: 0.5em 1.0em;
  border-width: 0;
  border-radius: 10px;
  background-color: dodgerblue;
  color: #FFFFFF;
  font-weight: bold;
  transition: all .25s ease-in-out;
  cursor: pointer;
  text-decoration-line: none;
}
</style>