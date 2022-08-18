<script setup lang="ts">
import { notify } from 'notiwind';
import { Game } from '~~/models/game';

const route = useRoute();
const router = useRouter();
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

const isRemovingGame = ref(false);
const removeGame = async () => {
  try {
    const gameFilesStoragePaths = [
      game.value.file,
      game.value.cover,
      ...game.value.screenshots
    ]
      .filter(Boolean)
      .map((url: string) => url.split('files/')[1]);

    await supabase.storage.from('files').remove(gameFilesStoragePaths);

    await supabase
      .from('games_favorited_by')
      .delete()
      .match({ game_id: game.value.id });

    await supabase
      .from('games_collections')
      .delete()
      .match({ game_id: game.value.id });

    await supabase.from('games').delete().match({ id: game.value.id });

    notify(
      {
        group: 'notifications',
        type: 'success',
        text: 'Game deleted successfully!'
      },
      4000
    );
    await router.push('/');
  } catch (error) {
    notify(
      {
        group: 'notifications',
        type: 'error',
        text: 'Failed to delete the game!'
      },
      4000
    );
  } finally {
    isRemovingGame.value = false;
  }
};

onMounted(
  () => (route.meta.layout = error.value || !game.value ? 'hero' : 'default')
);
</script>

<template>
  <div class="md:w-1/2 w-5/6">
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
        <div class="w-96 h-80 bg-primary"></div>
        <h1 class="text-4xl font-bold mt-6">{{ game.title }}</h1>
        <p class="text-xl mt-4">
          Uploaded by
          <NuxtLink :to="`/users/${game.uploader?.id}/games`">
            <strong
              class="text-primary hover:text-primary-focus transition duration-300"
            >
              {{ game.uploader?.raw_user_meta_data.full_name }}
            </strong>
          </NuxtLink>
        </p>
        <div v-if="user?.id === game.uploader?.id" class="w-full my-6">
          <NuxtLink :to="`/games/${game.id}/edit`" class="btn btn-warning mr-4">
            <i class="fa-solid fa-pen mr-3"></i>
            Edit
          </NuxtLink>
          <a href="#removal-confirmation-modal" class="btn btn-error">
            <i class="fa-solid fa-trash-can mr-3"></i>
            Remove
          </a>
          <RemovalConfirmationModal
            :confirmation-phrase="game.title"
            :removal-in-progress="isRemovingGame"
            @confirm="removeGame()"
          />
        </div>
        <div v-if="game.tags.length > 0" class="w-full">
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
      </div>
    </template>
  </div>
</template>
