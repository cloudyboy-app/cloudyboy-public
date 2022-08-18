<script setup lang="ts">
import { notify } from 'notiwind';
import { Collection } from '~~/models/collection';

definePageMeta({
  middleware: 'auth'
});

const route = useRoute();
const router = useRouter();
const supabase = useSupabaseClient();
const user = useSupabaseUser();

const initialValues = reactive<Partial<Collection>>({
  title: '',
  description: ''
});
const isCreatingCollection = ref(false);

const onSubmit = async (collection: Partial<Collection>) => {
  try {
    isCreatingCollection.value = true;
    collection.owner_id = user.value.id;

    const { data } = await supabase
      .from<Collection>('collections')
      .insert([collection])
      .throwOnError();

    const [createdCollectionEntry] = data;

    if (route.query.gameToAdd) {
      await supabase
        .from('games_collections')
        .insert([
          {
            game_id: route.query.gameToAdd as string,
            collection_id: createdCollectionEntry.id
          }
        ])
        .throwOnError();
    }

    notify(
      {
        group: 'notifications',
        type: 'success',
        text: 'Collection created successfully!'
      },
      4000
    );
    await router.push(`/collections/${createdCollectionEntry.id}`);
  } catch (error) {
    notify(
      {
        group: 'notifications',
        type: 'error',
        text: 'Failed to create a collection!'
      },
      4000
    );
  } finally {
    isCreatingCollection.value = false;
  }
};
</script>

<template>
  <div class="lg:w-2/5 w-10/12">
    <h1 class="text-4xl font-bold mb-6">Create new collection</h1>
    <CollectionsForm
      :initial-values="initialValues"
      :loading="isCreatingCollection"
      @submit="onSubmit"
    />
  </div>
</template>
