<script setup lang="ts">
const props = defineProps<{
  open: boolean
  planet: string
}>()

const shipyardOptions = [
  { id: 'frigate', name: 'Frigate Hull', cost: '220 Materials', time: '3y', description: 'Balanced escort ship.' },
  { id: 'carrier', name: 'Light Carrier', cost: '340 Materials / 40 Rare', time: '4y', description: 'Deploys fighter wings.' },
  { id: 'probe', name: 'Deep Space Probe', cost: '80 Energy', time: '1y', description: 'Extends intel network.' }
]
</script>

<template>
  <div>
    <p class="text-sm uppercase tracking-[0.2em] text-slate-400">
      Shipyard
    </p>
    <p class="text-lg font-semibold text-slate-100">
      {{ props.planet || 'Selected planet' }}
    </p>
  </div>

  <div class="space-y-3">
    <UCard
      v-for="item in shipyardOptions"
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

  <div class="flex gap-2">
    <UButton
      color="neutral"
      variant="soft"
      block
    >
      Cancel
    </UButton>
    <UButton
      color="primary"
      variant="solid"
      block
    >
      Launch Construction
    </UButton>
  </div>
</template>
