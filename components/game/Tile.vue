<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { Game } from '~~/models/game';

const props = defineProps<{ game: Game }>();
const { game } = toRefs(props);
</script>

<template>
  <NuxtLink :to="`/games/${game.id}`">
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
        <p class="truncate">
          Uploaded by
          <strong>{{ game.uploader.raw_user_meta_data.full_name }}</strong>
        </p>
      </div>
    </div>
  </NuxtLink>
</template>
