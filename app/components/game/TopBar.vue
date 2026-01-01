<script setup lang="ts">
const props = defineProps<{
  year: number
}>()

const emit = defineEmits<{
  (e: 'end-year'): void
}>()
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
    <div class="flex items-center justify-between px-6 py-3">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <UBadge
            color="primary"
            variant="solid"
            class="uppercase tracking-[0.2em] bg-cyan-500 text-slate-950"
          >
            AI Wars
          </UBadge>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <span class="text-sm text-slate-400">Year {{ props.year }}</span>
        <span class="text-sm text-slate-400">Players: 3</span>
        <span class="text-sm text-slate-400">Timer: 47s</span>
      </div>
      <div class="flex items-center gap-2">
        <UButton
          color="neutral"
          variant="soft"
          icon="i-lucide-skip-forward"
          size="sm"
          @click="emit('end-year')"
        >
          End Year
        </UButton>
      </div>
    </div>
  </header>
</template>
