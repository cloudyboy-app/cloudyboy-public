<script setup lang="ts">
useHead({ title: 'CloudyBoy' });
</script>

<template>
  <div class="drawer">
    <input id="drawer-toggle" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content flex flex-col">
      <div
        class="navbar bg-base-100 fixed top-0 w-full z-50 border-b-[1px] border-gray-600"
      >
        <div class="lg:flex-none flex-1">
          <NuxtLink to="/" class="btn btn-ghost normal-case text-xl">
            CloudyBoy
          </NuxtLink>
        </div>
        <div class="flex-none lg:hidden">
          <label for="drawer-toggle" class="btn btn-square btn-ghost">
            <i class="fa-solid fa-bars text-lg"></i>
          </label>
        </div>
        <div class="flex-1 hidden lg:block">
          <NavItems class="w-full menu menu-horizontal" />
        </div>
      </div>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
      <ToastGroup />
    </div>
    <div class="drawer-side">
      <label for="drawer-toggle" class="drawer-overlay"></label>
      <NavItems class="menu p-4 overflow-y-auto w-80 bg-base-100" />
    </div>
  </div>
</template>
