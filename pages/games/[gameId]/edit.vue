<script setup lang="ts">
import { notify } from 'notiwind';
import { Game } from '~~/models/game';

definePageMeta({
  middleware: ['auth']
});

const route = useRoute();
const router = useRouter();
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

  data.tagToAdd = '';

  return data;
});

const isUpdatingGame = ref(false);

const onSubmit = async (data: Partial<Game>) => {
  try {
    isUpdatingGame.value = true;

    await supabase
      .from<Game>('games')
      .update(data)
      .match({ id: gameId })
      .throwOnError();

    await refresh();

    notify(
      {
        group: 'notifications',
        type: 'success',
        text: 'Game updated successfully!'
      },
      4000
    );
    await router.push(`/games/${gameId}`);
  } catch (error) {
    notify(
      {
        group: 'notifications',
        type: 'error',
        text: 'Failed to update the game!'
      },
      4000
    );
  } finally {
    isUpdatingGame.value = false;
  }
};

onMounted(
  () => (route.meta.layout = error.value || !game.value ? 'hero' : 'default')
);
</script>

<template>
  <div class="lg:w-2/5 w-10/12">
    <PageLoadingSpinner v-if="pending" />
    <div v-else-if="error" class="alert alert-error shadow-lg flex-col">
      <div class="text-base">Something went wrong while fetching the game</div>
      <button class="btn btn-sm" @click="refresh()">Try again</button>
    </div>
    <template v-else>
      <template v-if="!game">
        <h1 class="text-4xl font-bold mb-4">Oh no!</h1>
        <p class="text-xl mb-12">We couldn't find this game in our database</p>
      </template>
      <template v-else>
        <h1 class="text-4xl font-bold mb-6">
          Edit <em>{{ game.title }}</em>
        </h1>
        <GameForm
          :initial-values="game"
          :loading="isUpdatingGame"
          edit-mode
          @submit="onSubmit"
        />
      </template>
    </template>
  </div>
</template>
