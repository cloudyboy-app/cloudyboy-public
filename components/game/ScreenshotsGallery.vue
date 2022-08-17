<script setup lang="ts">
const props = defineProps<{ screenshots: string[] }>();

const getScreenshotAltText = (index: number) => `Screenshot ${index + 1}`;
const getSlideId = (index: number) => `slide${index}`;
const getSlideHref = (index: number) => `#${getSlideId(index)}`;
const getArrowsJustifyClass = (index: number) =>
  index === 0
    ? 'justify-end'
    : index === props.screenshots.length - 1
    ? 'justify-start'
    : 'justify-between';
</script>

<template>
  <div class="w-full">
    <h2 class="text-3xl font-bold my-6">Gallery</h2>
    <div class="carousel w-full">
      <div
        v-for="(screenshot, index) of props.screenshots"
        :id="getSlideId(index)"
        :key="getSlideId(index)"
        class="carousel-item relative w-full"
      >
        <img
          :src="screenshot"
          :alt="getScreenshotAltText(index)"
          class="w-full"
        />
        <div
          class="absolute flex transform -translate-y-1/2 left-5 right-5 top-1/2"
          :class="[getArrowsJustifyClass(index)]"
        >
          <a
            v-if="index !== 0"
            :href="getSlideHref(index - 1)"
            class="btn btn-circle"
          >
            <i class="fa-solid fa-chevron-left"></i>
          </a>
          <a
            v-if="index !== props.screenshots.length - 1"
            :href="getSlideHref(index + 1)"
            class="btn btn-circle"
          >
            <i class="fa-solid fa-chevron-right"></i>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
