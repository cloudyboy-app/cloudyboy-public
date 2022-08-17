<script setup lang="ts">
const emit = defineEmits<{ (event: 'retry'): void }>();
</script>

<template>
  <div class="alert alert-error shadow-lg flex-col">
    <div class="text-base">
      <slot />
    </div>
    <button class="btn btn-sm" @click="emit('retry')">Try again</button>
  </div>
</template>
