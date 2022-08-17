<script setup lang="ts">
import { notify } from 'notiwind';
import { Game } from '~~/models/game';

const props = defineProps<{ game: Game }>();
const { game } = toRefs(props);

const router = useRouter();
const supabase = useSupabaseClient();

const userPhrase = ref('');
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
        text: 'Failed to remove the game!'
      },
      4000
    );
  } finally {
    isRemovingGame.value = false;
  }
};
</script>

<template>
  <div id="removal-confirm-modal" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Are you sure?</h3>
      <p class="py-4">
        This action is irreversible! It will result in both the game entry and
        all the files associated with it being deleted. Please type in
        <strong>{{ props.game.title }}</strong> to confirm removal:
      </p>
      <input
        v-model="userPhrase"
        type="text"
        class="input input-bordered w-full max-w-xs"
        :disabled="isRemovingGame"
      />
      <div class="modal-action justify-center gap-1">
        <a
          href="#"
          class="btn"
          :class="{ 'btn-disabled': isRemovingGame }"
          @click="userPhrase = ''"
        >
          Nevermind
        </a>
        <button
          class="btn btn-error"
          :class="{ loading: isRemovingGame }"
          :disabled="userPhrase !== props.game.title || isRemovingGame"
          @click="removeGame()"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
</template>
