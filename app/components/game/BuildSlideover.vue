<script setup lang="ts">
const props = defineProps<{
  open: boolean
  planet: string
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'confirm'): void
}>()

const buildOptions = [
  { id: 'hab', name: 'Hab Complex', cost: '120 Materials', time: '2y', description: 'Boosts population cap and upkeep efficiency.' },
  { id: 'lab', name: 'Quantum Lab', cost: '180 Energy', time: '3y', description: 'Adds +2 research throughput.' },
  { id: 'shield', name: 'Aegis Shield', cost: '140 Materials / 30 Rare', time: '3y', description: 'Planetary defense matrix.' }
]
</script>

<template>
  <USlideover
    :model-value="props.open"
    side="right"
    @update:model-value="(val: boolean) => emit('update:open', val)"
  >
    <template #header>
      <div>
        <p class="text-sm uppercase tracking-[0.2em] text-slate-400">
          Build
        </p>
        <p class="text-lg font-semibold text-cyan-200">
          {{ props.planet || 'Selected planet' }}
        </p>
      </div>
    </template>

    <div class="space-y-3">
      <UCard
        v-for="item in buildOptions"
        :key="item.id"
        color="neutral"
        variant="soft"
        class="border border-slate-800 bg-slate-900/80"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="font-semibold text-slate-100">
              {{ item.name }}
            </p>
            <p class="text-xs text-slate-400">
              {{ item.description }}
            </p>
          </div>
          <div class="text-right text-xs text-slate-400">
            <p>{{ item.cost }}</p>
            <p>{{ item.time }}</p>
          </div>
        </div>
      </UCard>
    </div>

    <template #footer>
      <div class="flex gap-2">
        <UButton
          color="neutral"
          variant="soft"
          block
          @click="emit('update:open', false)"
        >
          Cancel
        </UButton>
        <UButton
          color="primary"
          variant="solid"
          block
          @click="emit('confirm')"
        >
          Confirm Queue
        </UButton>
      </div>
    </template>
  </USlideover>
</template>
