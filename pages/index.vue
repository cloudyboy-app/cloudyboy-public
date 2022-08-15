<script setup lang="ts">
import { Game } from '~~/models/game';

const route = useRoute();
const supabase = useSupabaseClient();

const {
  pending,
  error,
  data: games,
  refresh
} = await useAsyncData('home-page-games', async () => {
  const { data: recentlyPlayedGames } = await supabase
    .from<Game>('games')
    .select()
    .not('date_last_played', 'is', null)
    .throwOnError();

  if (recentlyPlayedGames.length > 0) return recentlyPlayedGames;

  const { data: allGames } = await supabase
    .from<Game>('games')
    .select('*')
    .throwOnError();

  return allGames;
});

const subtitleFragment = computed(() =>
  games.value?.every((game) => game.date_last_played === null)
    ? 'newly added'
    : 'recently played'
);

onMounted(
  () =>
    (route.meta.layout =
      error.value || games.value?.length === 0 ? 'hero' : 'default')
);
</script>

<template>
  <div class="lg:w-5/6 md:w-4/5 w-3/5">
    <i v-if="pending" class="fa-solid fa-spinner fa-spin text-8xl"></i>
    <div v-else-if="error" class="alert alert-error shadow-lg flex-col">
      <div class="text-base">Something went wrong while fetching games</div>
      <button class="btn btn-sm" @click="refresh()">Try again</button>
    </div>
    <template v-else>
      <template v-if="games.length === 0">
        <h1 class="text-5xl font-bold">Welcome to CloudyBoy!</h1>
        <p class="text-xl py-5">
          It looks like you haven't uploaded any games yet...
        </p>
        <NuxtLink to="/games/upload" class="btn btn-primary text-sm">
          <i class="fa-solid fa-cloud-arrow-up mr-3"></i>
          Upload a game
        </NuxtLink>
      </template>
      <template v-else>
        <h1 class="text-4xl font-bold mb-4">Welcome back!</h1>
        <p class="text-xl mb-12">Here are your {{ subtitleFragment }} games</p>
        <div
          class="grid gap-11 grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 z-10"
        >
          <NuxtLink
            v-for="game of games"
            :key="game.id"
            :to="`/games/${game.id}`"
          >
            <div
              class="card card-compact w-full bg-base-100 shadow-xl transition-all ease-in-out duration-300 hover:shadow-2xl hover:scale-110 active:shadow-md active:scale-90 z-10"
            >
              <figure class="max-w-lg h-auto p-5 pb-2">
                <img
                  class="rounded-md shadow-2xl"
                  :src="(game.cover as string)"
                  :alt="`Cover image of ${game.title}`"
                />
              </figure>
              <div class="card-body items-center text-center">
                <h2 class="card-title">{{ game.title }}</h2>
                <p class="truncate">By <strong>AUTHOR HERE</strong></p>
              </div>
            </div>
          </NuxtLink>
        </div>
      </template>
    </template>
  </div>
</template>
