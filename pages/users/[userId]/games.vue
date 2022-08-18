<script setup lang="ts">
import { Game } from '~~/models/game';

const route = useRoute();
const supabase = useSupabaseClient();

const userId = route.params.userId as string;

const {
  error,
  data: games,
  refresh
} = await useAsyncData(`games-by-${userId}`, async () => {
  const { error, data } = await supabase
    .from<Game>('games')
    .select(
      `
      id,
      title,
      cover,
      uploader:profiles!uploader_id(*)
    `
    )
    .eq('uploader_id', userId);

  if (error) throw error;

  return data;
});
</script>

<template>
  <div class="md:w-full w-3/4 mx-auto my-0">
    <ErrorAlert v-if="error" @retry="refresh()">
      Something went wrong while fetching this user's games
    </ErrorAlert>
    <p v-else-if="!games?.length" class="text-center">
      This user hasn't uploaded any games yet
    </p>
    <GameTileGrid v-else :games="games" />
  </div>
</template>
