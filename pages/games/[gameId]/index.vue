<script setup lang="ts">
import { Game } from '~~/models/game';

const route = useRoute();
const supabase = useSupabaseClient();

const gameId = route.params.gameId as string;

const {
  pending,
  error,
  data: game,
  refresh
} = await useAsyncData(`game-${gameId}`, async () => {
  const { error, data } = await supabase
    .from<Game>('games')
    .select()
    .eq('id', gameId)
    .limit(1)
    .single();

  if (error) throw error;

  return data;
});

const getSlideId = (index: number) => `slide${index}`;

onMounted(
  () => (route.meta.layout = error.value || !game.value ? 'hero' : 'default')
);
</script>

<template>
  <div class="md:w-1/2 w-5/6">
    <i v-if="pending" class="fa-solid fa-spinner fa-spin text-8xl"></i>
    <div v-else-if="error" class="alert alert-error shadow-lg flex-col">
      <div class="text-base">Something went wrong while fetching the game</div>
      <button class="btn btn-sm" @click="refresh()">Try again</button>
    </div>
    <template v-else>
      <template v-if="!game">
        <h1 class="text-4xl font-bold mb-4">Oh no!</h1>
        <p class="text-xl mb-12">We couldn't find this game in our database</p>
      </template>
      <div v-else class="w-full flex flex-col items-center">
        <div class="w-96 h-80 bg-primary"></div>
        <h1 class="text-4xl font-bold my-6">{{ game.title }}</h1>
        <div v-if="game.tags.length > 0" class="w-full">
          <span
            v-for="tag of game.tags"
            :key="tag"
            class="badge text-base mb-4 mr-4 p-4"
          >
            {{ tag }}
          </span>
        </div>
        <div v-if="game.screenshots.length > 0" class="w-full">
          <h2 class="text-3xl font-bold my-6">Gallery</h2>
          <div class="carousel w-full">
            <div
              v-for="(screenshot, index) of game.screenshots"
              :id="getSlideId(index)"
              :key="getSlideId(index)"
              class="carousel-item relative w-full"
            >
              <img :src="(screenshot as string)" class="w-full" />
              <div
                class="absolute flex transform -translate-y-1/2 left-5 right-5 top-1/2"
                :class="[
                  index === 0
                    ? 'justify-end'
                    : index === game.screenshots.length - 1
                    ? 'justify-start'
                    : 'justify-between'
                ]"
              >
                <a
                  v-if="index !== 0"
                  :href="`#${getSlideId(index - 1)}`"
                  class="btn btn-circle"
                >
                  <i class="fa-solid fa-chevron-left"></i>
                </a>
                <a
                  v-if="index !== game.screenshots.length - 1"
                  :href="`#${getSlideId(index + 1)}`"
                  class="btn btn-circle"
                >
                  <i class="fa-solid fa-chevron-right"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div class="w-full">
          <h2 class="text-3xl font-bold my-6">About this game</h2>
          <p class="text-left leading-loose">{{ game.description }}</p>
        </div>
      </div>
    </template>
  </div>
</template>
