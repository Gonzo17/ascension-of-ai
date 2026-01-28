<script setup lang="ts">
type ButtonState = 'action-required' | 'ready' | 'waiting'

const buttonState = ref<ButtonState>('action-required') // Start with pending actions for demo

// Mock player states - in real implementation this would come from server
const players = ref([
  { id: 'p1', name: 'Du', ready: false, isCurrentPlayer: true },
  { id: 'p2', name: 'KI Alpha', ready: false, isCurrentPlayer: false },
  { id: 'p3', name: 'KI Beta', ready: false, isCurrentPlayer: false }
])

const readyCount = computed(() => players.value.filter((p: { ready: boolean }) => p.ready).length)
const totalPlayers = computed(() => players.value.length)

const isWaiting = computed(() => buttonState.value === 'waiting')
const isActionRequired = computed(() => buttonState.value === 'action-required')
const isReady = computed(() => buttonState.value === 'ready')

const handleClick = () => {
  switch (buttonState.value) {
    case 'action-required':
      // For demo: clicking dismisses the warning and goes to ready state
      // In real implementation: would navigate to pending action
      buttonState.value = 'ready'
      break

    case 'ready':
      // Mark current player as ready and start waiting
      const currentPlayer = players.value.find((p: { isCurrentPlayer: boolean }) => p.isCurrentPlayer)
      if (currentPlayer) {
        currentPlayer.ready = true
      }
      buttonState.value = 'waiting'

      // Simulate other players becoming ready over time
      setTimeout(() => {
        const player = players.value[1]
        if (player) {
          player.ready = true
        }
      }, 2000)
      break

    case 'waiting':
      // Cancel wait
      cancelWait()
      break
  }
}

const cancelWait = () => {
  buttonState.value = 'action-required' // Reset to action-required for demo
  players.value.forEach((p: { ready: boolean }) => p.ready = false)
}
</script>

<template>
  <div class="fixed bottom-10 right-10 z-30">
    <!-- Main Button Container - this is the anchor -->
    <div class="relative w-24 h-24">
      <!-- Waiting State Panel - positioned above button -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-4 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-4 scale-95"
      >
        <div
          v-if="isWaiting"
          class="absolute bottom-full -right-2 mb-10 w-64 rounded-xl border border-neutral-700 bg-neutral-900/95 backdrop-blur-sm shadow-2xl overflow-hidden"
        >
          <!-- Header -->
          <div class="px-4 py-3 border-b border-neutral-800 bg-neutral-800/50">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-neutral-200">
                {{ $t('game.end-turn.waiting-title') }}
              </span>
              <span class="text-xs font-mono text-primary-400">
                {{ readyCount }}/{{ totalPlayers }}
              </span>
            </div>
          </div>

          <!-- Player List -->
          <div class="p-3 space-y-2">
            <div
              v-for="player in players"
              :key="player.id"
              class="flex items-center justify-between px-3 py-2 rounded-lg transition-colors"
              :class="player.ready ? 'bg-success-500/10' : 'bg-neutral-800/50'"
            >
              <div class="flex items-center gap-2">
                <UIcon
                  :name="player.isCurrentPlayer ? 'i-lucide-user' : 'i-lucide-bot'"
                  class="text-sm"
                  :class="player.isCurrentPlayer ? 'text-primary-400' : 'text-neutral-500'"
                />
                <span
                  class="text-sm"
                  :class="player.isCurrentPlayer ? 'text-neutral-200 font-medium' : 'text-neutral-400'"
                >
                  {{ player.name }}
                </span>
              </div>
              <div class="flex items-center">
                <UIcon
                  v-if="player.ready"
                  name="i-lucide-check-circle"
                  class="text-success-400"
                />
                <div
                  v-else
                  class="flex items-center gap-1"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-warning-400 animate-pulse" />
                  <span class="text-xs text-neutral-500">{{ $t('game.end-turn.waiting') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Outer glow ring - always visible -->
      <div
        class="absolute -inset-2 rounded-full opacity-60 blur-md transition-all duration-500"
        :class="{
          'bg-neutral-500/40': isWaiting,
          'bg-info-500/50': isActionRequired,
          'bg-primary-500/50': isReady
        }"
      />

      <!-- Rotating orbital ring -->
      <div
        class="absolute -inset-3 rounded-full border transition-colors duration-300 animate-[spin_8s_linear_infinite]"
        :class="{
          'border-neutral-400/30': isWaiting,
          'border-info-400/30': isActionRequired,
          'border-primary-400/30': isReady
        }"
      >
        <div
          class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full transition-colors duration-300"
          :class="{
            'bg-neutral-400': isWaiting,
            'bg-info-400': isActionRequired,
            'bg-primary-400': isReady
          }"
        />
      </div>

      <!-- Second orbital ring (counter-rotation) -->
      <div
        class="absolute -inset-5 rounded-full border animate-[spin_12s_linear_infinite_reverse] transition-colors duration-300"
        :class="{
          'border-neutral-400/20': isWaiting,
          'border-info-400/20': isActionRequired,
          'border-primary-400/20': isReady
        }"
      >
        <div
          class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full transition-colors duration-300"
          :class="{
            'bg-neutral-300': isWaiting,
            'bg-info-300': isActionRequired,
            'bg-primary-300': isReady
          }"
        />
      </div>

      <!-- Main Button -->
      <button
        class="group relative flex items-center justify-center w-24 h-24 rounded-full shadow-2xl transition-all duration-300 overflow-hidden hover:scale-105"
        :class="{
          'bg-linear-to-br from-neutral-400 via-neutral-500 to-neutral-600 text-neutral-950 hover:shadow-[0_0_40px_rgba(148,163,184,0.5)]': isWaiting,
          'bg-linear-to-br from-info-400 via-info-500 to-info-600 text-info-950 hover:shadow-[0_0_40px_rgba(34,211,238,0.5)]': isActionRequired,
          'bg-linear-to-br from-primary-400 via-primary-500 to-primary-600 text-primary-950 hover:shadow-[0_0_40px_rgba(139,92,246,0.5)]': isReady
        }"
        @click="handleClick"
      >
        <!-- Inner glow effect -->
        <div class="absolute inset-0 rounded-full bg-linear-to-t from-transparent via-white/10 to-white/20" />

        <!-- Scan line effect -->
        <div class="absolute inset-0 rounded-full overflow-hidden">
          <div
            class="absolute inset-0 animate-[scan_2s_ease-in-out_infinite] transition-colors duration-300"
            :class="{
              'bg-linear-to-b from-transparent via-neutral-200/10 to-transparent': isWaiting,
              'bg-linear-to-b from-transparent via-info-200/10 to-transparent': isActionRequired,
              'bg-linear-to-b from-transparent via-primary-200/10 to-transparent': isReady
            }"
          />
        </div>

        <!-- Icon -->
        <UIcon
          :name="isWaiting ? 'i-lucide-loader-circle' : isActionRequired ? 'i-lucide-clipboard-list' : 'i-lucide-play'"
          class="relative z-10 drop-shadow-lg text-4xl"
          :class="{ 'animate-spin': isWaiting }"
        />
      </button>
    </div>
  </div>
</template>

<style scoped>
@keyframes scan {
  0%, 100% {
    transform: translateY(-100%);
  }
  50% {
    transform: translateY(100%);
  }
}
</style>
