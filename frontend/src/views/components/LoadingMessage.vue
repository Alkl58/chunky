<template>
  <div v-if="message" class="flex rounded bg-amber-400 text-amber-900 min-h-[48px] mb-4">
    <div class="self-center p-2">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        class="icon icon-tabler icons-tabler-outline icon-tabler-loader-2 animate-spin">
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M12 3a9 9 0 1 0 9 9" />
      </svg>
    </div>
    <p class="self-center">{{ message }}</p>
  </div>
</template>

<script>
export default {
  props: {
    message: String
  }
}
</script>
