<script setup lang="ts">
const researchOptions = [
  { id: 'quantum-lattice', name: 'Quantum Lattice', time: '2y', bonus: '+10% research speed' },
  { id: 'stellar-forges', name: 'Stellar Forges', time: '3y', bonus: '+15% ship build' },
  { id: 'void-comms', name: 'Void Comms', time: '2y', bonus: 'Faster orders & intel' }
]

const selected = ref(researchOptions[0]?.id ?? '')

const radioOptions = computed(() => researchOptions.map(item => ({ value: item.id, label: item.name, description: item.bonus + ' · ' + item.time })))
</script>

<template>
  <div class="space-y-4">
    <header class="flex items-center justify-between">
      <div>
        <p class="text-sm uppercase tracking-[0.2em] text-slate-400">
          Research
        </p>
        <p class="text-lg font-semibold text-violet-200">
          Select next program
        </p>
      </div>
      <UBadge
        color="primary"
        variant="soft"
        size="xs"
      >
        {{ 'None' }}
      </UBadge>
    </header>

    <URadioGroup
      v-model="selected"
      :items="radioOptions"
      variant="table"
      indicator="hidden"
      class="space-y-2"
    />

    <div class="flex gap-2">
      <UButton
        block
        color="primary"
        variant="solid"
      >
        Confirm Research
      </UButton>
    </div>
  </div>
</template>
