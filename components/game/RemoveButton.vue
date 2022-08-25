<script setup lang="ts">
import { notify } from 'notiwind';
import { Game } from '~~/models/game';

const props = defineProps<{ game: Game }>();
const { game } = toRefs(props);

const supabase = useSupabaseClient();
const router = useRouter();

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
</script>

<template>
  <div class="contents">
    <a href="#removal-confirmation-modal" class="btn btn-error lg:mb-0 mb-2">
      <i class="fa-solid fa-trash-can mr-3"></i>
      Remove
    </a>
    <RemovalConfirmationModal
      :confirmation-phrase="game.title"
      :removal-in-progress="isRemovingGame"
      @confirm="removeGame()"
    />
  </div>
</template>
