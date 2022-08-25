<script setup lang="ts">
import { NotificationGroup, Notification } from 'notiwind';
</script>

<template>
  <NotificationGroup group="notifications">
    <div class="toast toast-end lg:w-auto w-full">
      <Notification v-slot="{ notifications }">
        <div
          v-for="notification of notifications"
          :key="notification.id"
          class="alert"
          :class="[`alert-${notification.type}`]"
        >
          <div class="flex-1 justify-center">{{ notification.text }}</div>
        </div>
      </Notification>
    </div>
  </NotificationGroup>
</template>
