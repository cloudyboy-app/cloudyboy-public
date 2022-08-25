<script setup lang="ts">
import { Game } from '~~/models/game';

const route = useRoute();
const supabase = useSupabaseClient();
const user = useSupabaseUser();

const gameId = route.params.gameId as string;

const {
  pending,
  error,
  data: game,
  refresh
} = await useAsyncData(`game-${gameId}`, async () => {
  const { error, data } = await supabase
    .from<Game>('games')
    .select(
      `
      id,
      title,
      date_created,
      cover,
      description,
      tags,
      screenshots,
      uploader:profiles!uploader_id(*)
    `
    )
    .eq('id', gameId)
    .limit(1)
    .single();

  if (error) throw error;

  return data;
});

const dateUploadedText = computed(() =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(game.value?.date_created || Date.now()))
);

onMounted(
  () => (route.meta.layout = error.value || !game.value ? 'hero' : 'default')
);
</script>

<template>
  <div class="lg:w-1/2 w-5/6">
    <PageLoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" @retry="refresh()">
      Something went wrong while fetching the game
    </ErrorAlert>
    <template v-else>
      <template v-if="!game">
        <h1 class="text-4xl font-bold mb-4">Oh no!</h1>
        <p class="text-xl mb-12">We couldn't find this game in our database</p>
      </template>
      <div v-else class="w-full flex flex-col items-center">
        <div
          class="w-full lg:mb-8 mb-5 flex lg:flex-row flex-col lg:gap-6 gap-3 justify-center items-center"
        >
          <div class="avatar">
            <div class="lg:w-52 w-44 lg:mr-0 mr-3 rounded-xl">
              <img
                :src="(game.cover as string)"
                :alt="`${game.title}'s cover art'`"
              />
            </div>
          </div>
          <div
            class="lg:text-left text-center self-center flex flex-col lg:gap-5 gap-3"
          >
            <span class="lg:text-4xl text-3xl font-bold lg:mt-0 mt-3">
              {{ game.title }}
            </span>
            <span class="text-xl">
              Uploaded by
              <NuxtLink :to="`/users/${game.uploader?.id}/games`">
                <strong
                  class="text-primary hover:text-primary-focus transition duration-300"
                >
                  {{ game.uploader?.raw_user_meta_data.full_name }}
                </strong>
              </NuxtLink>
              on {{ dateUploadedText }}
            </span>
          </div>
        </div>
        <div class="w-full lg:mt-0 mt-3 mb-8">
          <NuxtLink
            :to="`/games/${game.id}/play`"
            class="btn btn-success mr-4 lg:mb-0 mb-2"
          >
            <i class="fa-solid fa-rocket mr-3"></i>
            Launch
          </NuxtLink>
          <template v-if="user?.id === game.uploader?.id">
            <NuxtLink
              :to="`/games/${game.id}/edit`"
              class="btn btn-warning mr-4 lg:mb-0 mb-2"
            >
              <i class="fa-solid fa-pen mr-3"></i>
              Edit
            </NuxtLink>
            <GameRemoveButton :game="game" />
          </template>
        </div>
        <div v-if="game.tags.length > 0" class="w-full">
          <span class="text-lg mr-4">Tags:</span>
          <span
            v-for="tag of game.tags"
            :key="tag"
            class="badge text-base mb-4 mr-4 p-4"
          >
            {{ tag }}
          </span>
        </div>
        <div class="w-full">
          <h2 class="text-3xl font-bold my-6">About this game</h2>
          <p
            class="text-left leading-loose"
            :class="{ 'text-center italic': game.description.length === 0 }"
          >
            {{ game.description || 'No description' }}
          </p>
        </div>
        <GameScreenshotsGallery
          v-if="game.screenshots.length > 0"
          :screenshots="(game.screenshots as string[])"
        />
      </div>
    </template>
  </div>
</template>
