<script setup lang="ts">
import { notify } from 'notiwind';
import { Collection } from '~~/models/collection';

const route = useRoute();
const router = useRouter();
const supabase = useSupabaseClient();
const user = useSupabaseUser();

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

  const [collection] = data;

  return collection;
});

const isRemovingCollection = ref(false);
const removeCollection = async () => {
  try {
    await supabase
      .from('games_collections')
      .delete()
      .match({ collection_id: collectionId });

    await supabase.from('collections').delete().match({ id: collectionId });

    notify(
      {
        group: 'notifications',
        type: 'success',
        text: 'Collection removed successfully!'
      },
      4000
    );

    await router.push('/');
  } catch (error) {
    notify(
      {
        group: 'notifications',
        type: 'error',
        text: 'Failed to remove the collection!'
      },
      4000
    );
  } finally {
    isRemovingCollection.value = false;
  }
};

onMounted(
  () =>
    (route.meta.layout = error.value || !collection.value ? 'hero' : 'default')
);
</script>

<template>
  <div class="w-11/12">
    <PageLoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" @retry="refresh()">
      Something went wrong while fetching collection
    </ErrorAlert>
    <p v-else-if="!collection">It looks like this collection doesn't exist</p>
    <template v-else>
      <h1 class="text-4xl font-bold mb-5">{{ collection.title }}</h1>
      <p class="text-xl mb-5">
        Uploaded by
        <NuxtLink :to="`/users/${collection.owner.id}/games`">
          <strong class="text-primary hover:text-primary-focus">
            {{ collection.owner.raw_user_meta_data.full_name }}
          </strong>
        </NuxtLink>
      </p>
      <div v-if="user?.id === collection.owner.id" class="w-full mb-6">
        <NuxtLink
          :to="`/collections/${collection.id}/edit`"
          class="btn btn-warning mr-4"
        >
          <i class="fa-solid fa-pen mr-3"></i>
          Edit
        </NuxtLink>
        <a href="#removal-confirmation-modal" class="btn btn-error">
          <i class="fa-solid fa-trash-can mr-3"></i>
          Remove
        </a>
        <RemovalConfirmationModal
          :confirmation-phrase="collection.title"
          :removal-in-progress="isRemovingCollection"
          @confirm="removeCollection()"
        />
      </div>
      <p
        class="text-base mb-5"
        :class="{ 'text-center italic': collection.description.length === 0 }"
      >
        {{ collection.description || 'No description' }}
      </p>
      <GameTileGrid
        v-if="collection.games.length > 0"
        :games="collection.games"
      />
      <p class="text-center italic">There are no games in this collection</p>
    </template>
  </div>
</template>
