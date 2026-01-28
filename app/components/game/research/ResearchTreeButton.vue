<script setup lang="ts">
const emit = defineEmits<{
  (e: 'click'): void
}>()

const store = useResearchStore()

const hasActiveResearch = computed(() => !!store.activeResearch)
const progressPercent = computed(() => store.activeResearch?.progress ?? 0)
</script>

<template>
  <div class="relative">
    <UButton
      icon="i-lucide-git-branch"
      color="neutral"
      :variant="hasActiveResearch ? 'soft' : 'ghost'"
      size="sm"
      @click="emit('click')"
    />

    <!-- Active Research Indicator -->
    <span
      v-if="hasActiveResearch"
      class="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[9px] font-bold text-neutral-950 bg-info-400 rounded-full animate-pulse"
    >
      <UIcon
        name="i-lucide-flask-conical"
        class="w-2.5 h-2.5"
      />
    </span>
  </div>
</template>
