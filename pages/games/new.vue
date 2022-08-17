<script setup lang="ts">
import { notify } from 'notiwind';
import { Game } from '~~/models/game';

definePageMeta({
  middleware: 'auth'
});

const router = useRouter();
const supabase = useSupabaseClient();
const user = useSupabaseUser();

const initialValues = reactive<Partial<Game>>({
  title: '',
  description: '',
  file: null,
  cover: null,
  screenshots: [],
  tags: [],
  tagToAdd: ''
});
const isUploadingGame = ref(false);

const uploadFile = async (directory: string, file: File | string) => {
  const fileName = [...crypto.getRandomValues(new Uint32Array(5)).values()]
    .map((value) => value.toString(32))
    .join('');

  const fileExtension = (file as File).name.split('.').at(-1);
  const uploadPath = `${directory}/${fileName}.${fileExtension}`;

  const { error } = await supabase.storage
    .from('files')
    .upload(uploadPath, file);

  if (error) throw error;

  const { publicURL } = supabase.storage.from('files').getPublicUrl(uploadPath);

  return publicURL;
};

const onSubmit = async (game: Partial<Game>) => {
  try {
    isUploadingGame.value = true;

    game.uploader_id = user.value.id;
    game.file = await uploadFile('games', game.file);
    game.cover = await uploadFile('images/covers', game.cover);
    game.screenshots = await Promise.all(
      game.screenshots.map((screenshot) =>
        uploadFile('images/screenshots', screenshot)
      )
    );

    const { data: gameEntries } = await supabase
      .from<Game>('games')
      .insert([game])
      .throwOnError();

    const [gameEntry] = gameEntries;

    notify(
      {
        group: 'notifications',
        type: 'success',
        text: 'Game uploaded successfully!'
      },
      4000
    );
    await router.push(`/games/${gameEntry.id}`);
  } catch (error) {
    notify(
      {
        group: 'notifications',
        type: 'error',
        text: 'Failed to upload the game!'
      },
      4000
    );
  } finally {
    isUploadingGame.value = false;
  }
};
</script>

<template>
  <div class="lg:w-2/5 w-10/12">
    <h1 class="text-4xl font-bold mb-6">Upload new game</h1>
    <GameForm
      :initial-values="initialValues"
      :loading="isUploadingGame"
      @submit="onSubmit"
    />
  </div>
</template>
