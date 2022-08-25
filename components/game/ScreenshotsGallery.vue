<script setup lang="ts">
import Flicking, { FlickingOptions } from '@egjs/vue3-flicking';

const props = defineProps<{ screenshots: string[] }>();

const isDesktopScreen = useMediaQuery('(min-width: 1024px)');
const flickingOptions = computed<Partial<FlickingOptions>>(() => ({
  panelsPerView: 1,
  autoResize: true,
  inputType: isDesktopScreen.value ? [] : ['touch']
}));

const carousel = ref<Flicking | null>(null);
const panelChangeInProgress = ref(false);

const getScreenshotAltText = (index: number) => `Screenshot ${index + 1}`;
const getSlideId = (index: number) => `slide${index}`;
const showPreviousPanel = async () => {
  panelChangeInProgress.value = true;
  await carousel.value?.prev();
  panelChangeInProgress.value = false;
};
const showNextPanel = async () => {
  panelChangeInProgress.value = true;
  await carousel.value?.next();
  panelChangeInProgress.value = false;
};
</script>

<template>
  <div class="w-full lg:max-h-96 lg:mb-20 mb-12">
    <h2 class="text-3xl font-bold lg:my-6 my-3">Gallery</h2>
    <em class="lg:hidden block mb-6">Swipe left and right to change image</em>
    <div class="flex lg:justify-between justify-center items-center">
      <button
        class="btn btn-outline btn-circle lg:block hidden"
        :disabled="panelChangeInProgress || carousel?.index === 0"
        @click="showPreviousPanel()"
      >
        <i class="fa-solid fa-chevron-left"></i>
      </button>
      <Flicking
        ref="carousel"
        class="max-w-xl mx-auto my-0"
        :options="flickingOptions"
        hide-before-init
      >
        <div
          v-for="(screenshot, index) of props.screenshots"
          :id="getSlideId(index)"
          :key="getSlideId(index)"
          class="panel"
        >
          <img
            :src="screenshot"
            :alt="getScreenshotAltText(index)"
            class="w-full h-auto"
          />
        </div>
      </Flicking>
      <div class="flex lg:justify-between justify-center">
        <button
          class="btn btn-outline btn-circle lg:block hidden"
          :disabled="
            panelChangeInProgress ||
            carousel?.index === carousel?.panelCount - 1
          "
          @click="showNextPanel()"
        >
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>
