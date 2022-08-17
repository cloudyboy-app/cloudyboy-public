<script setup lang="ts">
import { notify } from 'notiwind';

const router = useRouter();
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const isDark = useSharedIsDark();

const signOut = async () => {
  try {
    await supabase.auth.signOut();

    notify(
      {
        group: 'notifications',
        type: 'success',
        text: "You've been signed out successfully!"
      },
      4000
    );
    await router.push('/sign-in');
  } catch (error) {
    notify(
      {
        group: 'notifications',
        type: 'error',
        text: 'Failed to sign you out!'
      },
      4000
    );
  }
};
</script>

<template>
  <ul>
    <li>
      <NuxtLink to="/games">
        <i class="fa-solid fa-gamepad"></i>
        Browse games
      </NuxtLink>
    </li>
    <template v-if="user">
      <li>
        <NuxtLink to="/games/new">
          <i class="fa-solid fa-cloud-arrow-up"></i>
          New game
        </NuxtLink>
      </li>
      <li>
        <NuxtLink to="/collections/create">
          <i class="fa-solid fa-folder-plus"></i>
          New collection
        </NuxtLink>
      </li>
    </template>
    <li>
      <NuxtLink to="/about">
        <i class="fa-solid fa-circle-info"></i>
        About
      </NuxtLink>
    </li>
    <li class="lg:ml-auto ml-0">
      <ClientOnly>
        <template #fallback>
          <a>
            <i class="fa-solid fa-hourglass-half"></i>
            Please wait...
          </a>
        </template>
        <label class="swap justify-start">
          <input v-model="isDark" type="checkbox" />
          <div class="swap-on flex content-center gap-3">
            <i class="fa-solid fa-sun self-center"></i>
            Use light theme
          </div>
          <div class="swap-off flex content-center gap-3">
            <i class="fa-solid fa-moon self-center"></i>
            Use dark theme
          </div>
        </label>
      </ClientOnly>
    </li>
    <template v-if="user">
      <li>
        <NuxtLink :to="`/users/${user.id}/games`">
          <i class="fa-solid fa-user"></i>
          Your profile
        </NuxtLink>
      </li>
      <li>
        <a @click="signOut()">
          <i class="fa-solid fa-sign-out"></i>
          Sign out
        </a>
      </li>
    </template>
    <li v-else>
      <NuxtLink to="/sign-in">
        <i class="fa-solid fa-sign-in"></i>
        Sign in
      </NuxtLink>
    </li>
  </ul>
</template>
