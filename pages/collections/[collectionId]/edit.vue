<script setup lang="ts">
import { notify } from 'notiwind';
import { Collection } from '~~/models/collection';

definePageMeta({
  middleware: 'auth'
});

const route = useRoute();
const router = useRouter();
const supabase = useSupabaseClient();

const collectionId = route.params.collectionId as string;

const {
  pending,
  error,
  data: collection,
  refresh
} = await useAsyncData(`collection-${collectionId}`, async () => {
  const { data, error } = await supabase
    .from<Collection>('collections')
    .select(
      `
        id,
        title,
        description,
        owner:profiles(*),
        games:games(*)
        `
    )
    .eq('id', collectionId);

  if (error) throw error;

  const [collectionEntry] = data;

  return collectionEntry;
});

const initialValues = reactive<Partial<Collection>>({
  title: collection.value.title,
  description: collection.value.description
});
const isCreatingCollection = ref(false);

const onSubmit = async (updatedCollectionData: Partial<Collection>) => {
  try {
    isCreatingCollection.value = true;

    await supabase
      .from<Collection>('collections')
      .update(updatedCollectionData)
      .match({ id: collectionId })
      .throwOnError();

    await router.push(`/collections/${collectionId}`);
  } catch (error) {
    notify(
      {
        group: 'notifications',
        type: 'error',
        text: 'Failed to update collection!'
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
    <PageLoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" @retry="refresh()">
      Something went wrong while fetching collection
    </ErrorAlert>
    <p v-else-if="!collection">It looks like this collection doesn't exist</p>
    <template v-else>
      <h1 class="text-4xl font-bold mb-6">Create a collection</h1>
      <CollectionsForm
        :initial-values="initialValues"
        :loading="isCreatingCollection"
        @submit="onSubmit"
      />
    </template>
  </div>
</template>
