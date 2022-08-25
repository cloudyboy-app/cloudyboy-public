<script setup lang="ts">
import { onBeforeRouteLeave } from 'vue-router';
import { $fetch } from 'ohmyfetch';

import { WasmBoy } from 'wasmboy';
import { notify } from 'notiwind';

import { Game } from '~~/models/game';

definePageMeta({ layout: 'hero' });

const route = useRoute();
const supabase = useSupabaseClient();
const user = useSupabaseUser();

const gameId = route.params.gameId as string;

const {
  pending,
  error,
  data: game,
  refresh
} = await useAsyncData(`url-of-game-${gameId}`, async () => {
  const { error, data } = await supabase
    .from<Game>('games')
    .select('file')
    .eq('id', gameId)
    .limit(1)
    .single();

  if (error) throw error;

  return data;
});

const saveReadWriteInProgress = ref(true);
const isPlaying = ref(false);
const canSetUpEmulator = ref(false);

const gameCanvas = ref<HTMLCanvasElement | null>(null);
const { enter: goFullscreen } = useFullscreen(gameCanvas);
const isWindowFocused = useWindowFocus();

const isLandscapeMobileScreen = useMediaQuery(
  '(orientation: landscape) and (max-device-height: 576px)'
);

const saveFilesDirectory = `savestates/${user.value.id}/${gameId}`;

const checkIfAutoSaveExists = async () => {
  if (!user.value) return false;

  const { error: fileSearchError, data: foundFiles } = await supabase.storage
    .from('files')
    .list(saveFilesDirectory, { search: 'auto.json' });

  if (fileSearchError) throw fileSearchError;

  return foundFiles.length > 0;
};

const createAndUploadSaveFile = async (fileName: string) => {
  saveReadWriteInProgress.value = true;

  const saveState = await WasmBoy.saveState();

  saveState.wasmboyMemory = Object.entries<Uint8Array>(
    saveState.wasmboyMemory
  ).reduce((memoryObj, [key, memoryUint8Array]) => {
    memoryObj[key] = [...memoryUint8Array.values()];

    return memoryObj;
  }, {});

  const { error: fileUploadError } = await supabase.storage
    .from('files')
    .upload(
      `${saveFilesDirectory}/${fileName}.json`,
      new TextEncoder().encode(JSON.stringify(saveState)),
      { contentType: 'application/json', cacheControl: '1', upsert: true }
    );

  if (fileUploadError) throw fileUploadError;
};

const loadSaveFile = async (fileName: string) => {
  const { publicURL } = supabase.storage
    .from('files')
    .getPublicUrl(`${saveFilesDirectory}/${fileName}.json`);

  const cloudSave = await $fetch(publicURL);

  cloudSave.wasmboyMemory = Object.entries<number[]>(
    cloudSave.wasmboyMemory
  ).reduce((memoryObj, [key, memoryValuesArray]) => {
    memoryObj[key] = new Uint8Array(memoryValuesArray);

    return memoryObj;
  }, {});

  await WasmBoy.loadState(cloudSave);
};

watchOnce(canSetUpEmulator, async () => {
  saveReadWriteInProgress.value = true;

  await WasmBoy.config(
    {
      headless: false,
      useGbcWhenOptional: true,
      isAudioEnabled: true,
      frameSkip: 1,
      audioBatchProcessing: true,
      timersBatchProcessing: false,
      audioAccumulateSamples: true,
      graphicsBatchProcessing: false,
      graphicsDisableScanlineRendering: false,
      tileRendering: true,
      tileCaching: true,
      gameboyFPSCap: 60,
      updateGraphicsCallback: false,
      updateAudioCallback: false,
      saveStateCallback: false
    },
    gameCanvas.value
  );

  await WasmBoy.loadROM(game.value.file);

  if (user.value) {
    try {
      const autoSaveAvailable = await checkIfAutoSaveExists();

      if (autoSaveAvailable) await loadSaveFile('auto');
    } catch (error) {
      notify(
        {
          group: 'notifications',
          type: 'error',
          text: 'Failed to load cloud autosave!'
        },
        4000
      );
    }
  }

  saveReadWriteInProgress.value = false;
  isPlaying.value = true;
});

watch(isPlaying, async (shouldNowPlay) =>
  shouldNowPlay ? await WasmBoy.play() : WasmBoy.pause()
);

watch(
  isWindowFocused,
  async (focused) =>
    WasmBoy.isReady() &&
    isPlaying.value &&
    (focused ? await WasmBoy.play() : await WasmBoy.pause())
);

onBeforeRouteLeave(async () => {
  if (WasmBoy.isLoadedAndStarted()) {
    if (user.value) {
      try {
        await createAndUploadSaveFile('auto');

        notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Cloud autosave uploaded!'
          },
          4000
        );
      } catch (error) {
        notify(
          {
            group: 'notifications',
            type: 'error',
            text: 'Failed to upload cloud autosave!'
          },
          4000
        );
      }
    }

    await WasmBoy.reset();
    saveReadWriteInProgress.value = false;
  }
});
</script>

<template>
  <div class="flex flex-1 gap-6 justify-center items-center">
    <PageLoadingSpinner v-if="pending" />
    <ErrorAlert v-if="error" @retry="refresh()">
      Something went wrong while loading the game
    </ErrorAlert>
    <p v-else-if="!game">It looks like this game doesn't exist</p>
    <template v-else>
      <div
        v-if="!canSetUpEmulator"
        class="lg:w-96 lg:h-96 w-80 h-80 bg-slate-900 flex flex-col gap-6 justify-center items-center"
      >
        <button
          class="btn btn-circle btn-lg btn-primary text-center"
          @click="canSetUpEmulator = true"
        >
          <i class="fa-solid fa-play mr-3"></i>
        </button>
      </div>
      <div v-if="saveReadWriteInProgress" class="text-8xl">
        <i class="fas fa-spin fa-spinner text-8xl"></i>
      </div>
      <div
        v-show="canSetUpEmulator && !saveReadWriteInProgress"
        class="flex flex-col gap-6 justify-center items-center"
      >
        <canvas ref="gameCanvas" class="lg:w-96 lg:h-96 w-64 h-64"></canvas>
        <div class="flex gap-4 justify-center">
          <div class="tooltip" :data-tip="isPlaying ? 'Pause' : 'Play'">
            <button
              class="btn btn-outline btn-circle"
              @click="isPlaying = !isPlaying"
            >
              <i
                class="fa-solid"
                :class="[isPlaying ? 'fa-pause' : 'fa-play']"
              ></i>
            </button>
          </div>
          <div class="tooltip" data-tip="Save state">
            <button class="btn btn-outline btn-circle">
              <i class="fa-solid fa-floppy-disk"></i>
            </button>
          </div>
          <div class="tooltip" data-tip="Load state">
            <button class="btn btn-outline btn-circle">
              <i class="fa-solid fa-file-arrow-up"></i>
            </button>
          </div>
          <div class="tooltip" data-tip="Go fullscreen">
            <button
              class="lg:block hidden btn btn-outline btn-circle"
              @click="goFullscreen"
            >
              <i class="fa-solid fa-expand"></i>
            </button>
          </div>
          <div
            v-if="isLandscapeMobileScreen"
            class="tooltip"
            data-tip="Exit game"
          >
            <NuxtLink
              :to="`/games/${gameId}`"
              class="btn btn-outline btn-circle"
            >
              <i class="fa-solid fa-door-open"></i>
            </NuxtLink>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
