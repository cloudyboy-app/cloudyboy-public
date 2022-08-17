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
        Browse games
      </NuxtLink>
    </template>
  </div>
</template>
