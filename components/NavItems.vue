<script setup lang="ts">
const isDark = useDark({
  selector: 'html',
  attribute: 'data-theme',
  valueDark: 'dark',
  valueLight: 'light'
});
</script>

<template>
  <ul>
    <li>
      <NuxtLink to="/games">
        <i class="fa-solid fa-gamepad"></i>
        Games
      </NuxtLink>
    </li>
    <li>
      <NuxtLink to="/collections">
        <i class="fa-solid fa-rectangle-list"></i>
        Collections
      </NuxtLink>
    </li>
    <li>
      <NuxtLink to="/games/upload">
        <i class="fa-solid fa-cloud-arrow-up"></i>
        Upload a game
      </NuxtLink>
    </li>
    <li>
      <NuxtLink to="https://github.com/cloudyboy-app/cloudyboy.app">
        <i class="fa-solid fa-code"></i>
        Source code
      </NuxtLink>
    </li>
    <li>
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
            <i class="fa-solid fa-moon self-center"></i>
            Dark theme
          </div>
          <div class="swap-off flex content-center gap-3">
            <i class="fa-solid fa-sun self-center"></i>
            Light theme
          </div>
        </label>
      </ClientOnly>
    </li>
  </ul>
</template>
