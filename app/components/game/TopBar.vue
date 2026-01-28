<script setup lang="ts">
// Local UI type for resources display
interface GameResource {
  key: string
  label: string
  amount: number
  delta: string
  accent: string
  icon: string
}

const props = defineProps<{
  year: number
  unreadEventCount: number
  resources: Array<GameResource>
  research: { id: string, yearsLeft: number, progress: number }
}>()

const emit = defineEmits<{
  (e: 'toggle-event-log' | 'open-research'): void
}>()

const { locale } = useI18n()
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur">
    <div class="flex items-center justify-between px-4 py-2 gap-4">
      <!-- Left Section: Logo & Year -->
      <div class="flex items-center gap-4 shrink-0">
        <UBadge
          color="primary"
          variant="solid"
          class="uppercase tracking-[0.15em] text-xs"
        >
          Ascension
        </UBadge>
        <div class="flex items-center gap-2 text-sm">
          <UIcon
            name="i-lucide-calendar"
            class="text-neutral-500"
          />
          <span class="font-mono text-neutral-200">{{ props.year }}</span>
        </div>
      </div>

      <!-- Center Section: Resources -->
      <div class="flex items-center gap-3 flex-1 justify-center">
        <div
          v-for="resource in props.resources"
          :key="resource.key"
          class="flex items-center gap-2 px-3 py-1.5 rounded-md bg-neutral-900/60 border border-neutral-800"
        >
          <UIcon
            :name="`i-lucide-${resource.icon}`"
            class="text-sm"
            :class="resource.accent"
          />
          <span class="font-mono text-sm text-neutral-200">
            {{ resource.amount.toLocaleString(locale) }}
          </span>
          <span
            class="text-xs"
            :class="resource.delta.startsWith('+') ? 'text-success-400' : 'text-critical-400'"
          >
            {{ resource.delta }}
          </span>
        </div>
      </div>

      <!-- Research Section -->
      <button
        class="relative flex items-center gap-3 px-3 py-1.5 rounded-md bg-neutral-900/60 border border-neutral-800 hover:border-primary-500 transition-colors cursor-pointer shrink-0 min-w-60"
        @click="emit('open-research')"
      >
        <!-- Progress bar background -->
        <div
          class="absolute inset-0 bg-primary-500/20 rounded-md transition-all duration-500"
          :style="{ width: props.research.progress + '%' }"
        />
        <UIcon
          name="i-lucide-atom"
          class="relative z-10 text-primary-400"
        />
        <div class="relative z-10 flex flex-col items-start">
          <span class="text-xs text-neutral-400">{{ $t('game.research.current-research') }}</span>
          <span class="text-sm font-medium text-primary-200">
            {{ $t('game.research.options.' + props.research.id + '.name') }}
          </span>
        </div>
        <div class="relative z-10 ml-auto flex items-center gap-1">
          <UIcon
            name="i-lucide-clock"
            class="text-xs text-neutral-500"
          />
          <span class="text-xs text-neutral-400">{{ props.research.yearsLeft }}y</span>
        </div>
      </button>

      <!-- Right Section: Game Info & Actions -->
      <div class="flex items-center gap-3 shrink-0">
        <!-- Placeholder for future info (enemies, etc.) -->
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-md bg-neutral-900/60 border border-neutral-800">
          <UIcon
            name="i-lucide-users"
            class="text-neutral-500"
          />
          <span class="text-sm text-neutral-400">{{ $t('game.top-bar.players', { count: 3 }) }}</span>
        </div>

        <div class="flex items-center gap-2 px-3 py-1.5 rounded-md bg-neutral-900/60 border border-neutral-800">
          <UIcon
            name="i-lucide-timer"
            class="text-neutral-500"
          />
          <span class="text-sm font-mono text-neutral-400">47s</span>
        </div>

        <CommonLanguageSwitch />

        <GameEventLogButton
          :unread-count="props.unreadEventCount"
          @click="emit('toggle-event-log')"
        />
      </div>
    </div>
  </header>
</template>
