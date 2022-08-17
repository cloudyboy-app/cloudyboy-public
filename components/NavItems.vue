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
        <NuxtLink :to="`/library/${user.id}`">
          <i class="fa-solid fa-folder-open"></i>
          Your library
        </NuxtLink>
      </li>
    </template>
    <li>
      <NuxtLink to="/about">
        <i class="fa-solid fa-circle-info"></i>
        About this project
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
    <li v-if="user">
      <a @click="signOut()">
        <i class="fa-solid fa-sign-out"></i>
        Sign out
      </a>
    </li>
    <li v-else>
      <NuxtLink to="/sign-in">
        <i class="fa-solid fa-sign-in"></i>
        Sign in
      </NuxtLink>
    </li>
  </ul>
</template>
