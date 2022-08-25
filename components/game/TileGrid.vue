<script setup lang="ts">
import { Game } from '~~/models/game';

const props = defineProps<{ games: Game[] }>();
const { games } = toRefs(props);
</script>

<template>
  <div
    class="grid gap-11 grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 z-10"
  >
    <GameTile v-for="game of games" :key="game.id" :game="game" />
  </div>
</template>
