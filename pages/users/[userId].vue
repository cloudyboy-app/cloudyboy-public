<script setup lang="ts">
import { Profile } from '~~/models/profile';

const route = useRoute();
const supabase = useSupabaseClient();

const userId = route.params.userId as string;

const {
  pending,
  error,
  data: libraryOwner,
  refresh
} = await useAsyncData(`library-${userId}`, async () => {
  const { data, error } = await supabase
    .from<Profile>('profiles')
    .select()
    .eq('id', userId);

  if (error) throw error;

  const [owner] = data;

  return owner;
});

const dateJoinedText = computed(() =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(libraryOwner.value?.date_created || Date.now()))
);

onMounted(() =>
  pending.value || error.value || !libraryOwner.value ? 'hero' : 'default'
);
</script>

<template>
  <div class="lg:w-5/6 w-11/12">
    <PageLoadingSpinner v-if="pending" />
    <ErrorAlert v-else-if="error" @retry="refresh()">
      Failed to fetch library user data
    </ErrorAlert>
    <p v-else-if="!libraryOwner" class="text-xl">
      It looks like this user doesn't exist
    </p>
    <template v-else>
      <div
        class="w-full lg:mb-8 mb-5 flex lg:flex-row flex-col lg:gap-5 md:gap-4 gap-3 justify-center items-center"
      >
        <div class="avatar">
          <div class="lg:w-32 w-28 rounded-xl">
            <img
              :src="(libraryOwner.raw_user_meta_data.avatar_url as string)"
              :alt="`${libraryOwner.raw_user_meta_data.full_name}'s avatar'`"
            />
          </div>
        </div>
        <div
          class="md:text-left md:self-end text-center self-center flex flex-col md:gap-3 gap-1"
        >
          <span class="md:text-4xl text-3xl font-bold">
            {{ libraryOwner.raw_user_meta_data.full_name }}
          </span>
          <span class="md:text-xl text-lg">
            Joined on {{ dateJoinedText }}
          </span>
        </div>
      </div>
      <div class="tabs tabs-boxed flex-nowrap overflow-x-auto justify-center">
        <NuxtLink
          class="tab md:tab-lg"
          active-class="tab-active"
          :to="`/users/${libraryOwner.id}/games`"
        >
          <i class="fa-solid fa-gamepad md:mr-3 mr-0"></i>
          Games
        </NuxtLink>
        <NuxtLink
          class="tab md:tab-lg"
          active-class="tab-active"
          :to="`/users/${libraryOwner.id}/collections`"
        >
          <i class="fa-solid fa-folder-open md:mr-3 mr-0"></i>
          Collections
        </NuxtLink>
        <NuxtLink
          class="tab md:tab-lg"
          active-class="tab-active"
          :to="`/users/${libraryOwner.id}/favorites`"
        >
          <i class="fa-solid fa-heart md:mr-3 mr-0"></i>
          Favorites
        </NuxtLink>
      </div>
      <div class="mt-8">
        <NuxtPage />
      </div>
    </template>
  </div>
</template>
