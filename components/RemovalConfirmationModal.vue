<script setup lang="ts">
const emit = defineEmits<{ (event: 'confirm'): void }>();
const props = defineProps<{
  confirmationPhrase: string;
  removalInProgress: boolean;
}>();

const { confirmationPhrase, removalInProgress } = toRefs(props);
const userPhrase = ref('');
</script>

<template>
  <div id="removal-confirmation-modal" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Are you sure?</h3>
      <p class="py-4">
        This action is irreversible! Please type in
        <strong>{{ confirmationPhrase }}</strong> to confirm removal:
      </p>
      <input
        v-model="userPhrase"
        type="text"
        class="input input-bordered w-full max-w-xs"
        :disabled="removalInProgress"
      />
      <div class="modal-action justify-center gap-1">
        <a
          href="#"
          class="btn"
          :class="{ 'btn-disabled': removalInProgress }"
          @click="userPhrase = ''"
        >
          Nevermind
        </a>
        <button
          class="btn btn-error"
          :class="{ loading: removalInProgress }"
          :disabled="userPhrase !== confirmationPhrase || removalInProgress"
          @click="emit('confirm')"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
</template>
