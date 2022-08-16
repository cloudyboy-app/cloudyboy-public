<script setup lang="ts">
definePageMeta({ layout: 'hero' });

const router = useRouter();
const user = useSupabaseUser();
const redirectCookie = useCookie<string | null>('redirect');

watch(user, async (newUserData) => {
  const redirectPath = redirectCookie.value;

  if (newUserData && redirectPath) {
    redirectCookie.value = null;
    await router.replace(redirectPath);
  }
});
</script>

<template>
  <div class="w-11/12">
    <i v-if="redirectCookie" class="fa-solid fa-spinner fa-spin text-8xl"></i>
    <template v-else>
      <h1 class="md:text-5xl text-4xl font-bold">Welcome to CloudyBoy!</h1>
      <p class="md:text-xl text-lg my-6">
        Upload and play homebrew Game Boy games directly from the browser
      </p>
      <NuxtLink to="/games/upload" class="btn btn-primary text-sm">
        <i class="fa-solid fa-search mr-3"></i>
        Browse games
      </NuxtLink>
    </template>
    <!-- <div
          class="grid gap-11 grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 z-10"
        >
          <NuxtLink
            v-for="game of games"
            :key="game.id"
            :to="`/games/${game.id}`"
          >
            <div
              class="card card-compact w-full bg-base-100 shadow-xl transition-all ease-in-out duration-300 hover:shadow-2xl hover:scale-110 active:shadow-md active:scale-90 z-10"
            >
              <figure class="max-w-lg h-auto p-5 pb-2">
                <img
                  class="rounded-md shadow-2xl"
                  :src="(game.cover as string)"
                  :alt="`Cover image of ${game.title}`"
                />
              </figure>
              <div class="card-body items-center text-center">
                <h2 class="card-title">{{ game.title }}</h2>
                <p class="truncate">By <strong>AUTHOR HERE</strong></p>
              </div>
            </div>
          </NuxtLink>
        </div> -->
  </div>
</template>
