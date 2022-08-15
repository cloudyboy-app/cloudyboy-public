<script setup lang="ts">
import { Game } from '~~/models/game';

const route = useRoute();
const router = useRouter();
const supabase = useSupabaseClient();

const gameId = route.params.gameId as string;

const {
  pending,
  error: gameFetchError,
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
const errorOccurred = ref<boolean | string | Error>(gameFetchError.value);

const onSubmit = async (data: Partial<Game>) => {
  try {
    isUpdatingGame.value = true;
    errorOccurred.value = false;

    await supabase
      .from<Game>('games')
      .update(data)
      .match({ id: gameId })
      .throwOnError();

    await refresh();
    await router.push(`/games/${gameId}`);
  } catch (error) {
    alert('Something went wrong!');
  } finally {
    isUpdatingGame.value = false;
  }
};

onMounted(
  () =>
    (route.meta.layout =
      gameFetchError.value || !game.value ? 'hero' : 'default')
);
</script>

<template>
  <div class="lg:w-2/5 w-10/12">
    <i v-if="pending" class="fa-solid fa-spinner fa-spin text-8xl"></i>
    <div v-else-if="errorOccurred" class="alert alert-error shadow-lg flex-col">
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
