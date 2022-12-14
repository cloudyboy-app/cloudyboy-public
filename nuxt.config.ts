import { defineNuxtConfig } from 'nuxt';
import eslintPlugin from 'vite-plugin-eslint';

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  css: [
    '@fortawesome/fontawesome-free/css/all.min.css',
    '@egjs/vue3-flicking/dist/flicking.min.css'
  ],
  modules: ['@nuxtjs/supabase', '@nuxtjs/tailwindcss', '@vueuse/nuxt'],
  vite: {
    plugins: [eslintPlugin()]
  }
});
