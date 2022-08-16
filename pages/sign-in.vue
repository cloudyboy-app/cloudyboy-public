<script setup lang="ts">
import { notify } from 'notiwind';

const supabase = useSupabaseClient();
const isSigningIn = ref(false);

const signIn = async (provider: 'github' | 'discord') => {
  try {
    isSigningIn.value = true;

    const { error } = await supabase.auth.signIn({ provider });

    if (error) throw error;
  } catch (error) {
    notify(
      {
        group: 'notifications',
        type: 'error',
        text: 'Failed to sign in!'
      },
      4000
    );
  } finally {
    isSigningIn.value = false;
  }
};

definePageMeta({ layout: 'hero' });
</script>

<template>
  <div class="w-5/6">
    <h1 class="text-4xl font-bold mb-6">Sign in via...</h1>
    <div class="flex justify-center gap-4">
      <button
        class="btn bg-[#333] text-white"
        :disabled="isSigningIn"
        @click="signIn('github')"
      >
        <i class="fa-brands fa-github mr-2 text-base"></i>
        GitHub
      </button>
      <button
        class="btn bg-[#5865f2] hover:bg-[#434dbb] text-white"
        :disabled="isSigningIn"
        @click="signIn('discord')"
      >
        <i class="fa-brands fa-discord mr-2 text-base"></i>
        Discord
      </button>
    </div>
  </div>
</template>
