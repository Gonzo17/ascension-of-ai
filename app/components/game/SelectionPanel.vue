<script setup lang="ts">
defineProps<{
  selectionType: 'planet' | 'army' | 'system' | 'research' | null
  selection: GamePlanet | GameArmy | GameSolarSystem | null
}>()

const emit = defineEmits<{
  (e: 'update:view-mode', mode: 'galaxy' | 'system'): void
}>()
</script>

<template>
  <UCard
    color="neutral"
    variant="soft"
    class="border border-slate-800 bg-slate-900/80 backdrop-blur"
  >
    <div
      v-if="!selection && selectionType !== 'research'"
      class="py-4 text-sm text-slate-400"
    >
      Nothing selected. Choose a system, planet, or army to see details.
    </div>

    <div
      v-else-if="selection && selectionType === 'planet' && 'owner' in selection"
      class="space-y-3"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-lg font-semibold text-cyan-200">
            {{ selection.name }}
          </p>
          <p class="text-xs text-slate-400">
            {{ selection.owner }} • {{ selection.type }}
          </p>
        </div>
        <UBadge
          color="primary"
          variant="soft"
          size="xs"
        >
          Planet
        </UBadge>
      </div>

      <div class="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2">
        <p class="text-xs uppercase tracking-wide text-slate-400">
          Buildings
        </p>
        <div class="mt-1 flex flex-wrap gap-1">
          <UBadge
            v-for="item in selection.buildings"
            :key="item"
            color="neutral"
            variant="subtle"
            size="xs"
          >
            {{ item }}
          </UBadge>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div class="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2">
          <p class="text-xs uppercase tracking-wide text-slate-400">
            Build Queue
          </p>
          <p
            v-if="!selection.queues.build.length"
            class="text-sm text-slate-500"
          >
            Idle
          </p>
          <ul
            v-else
            class="text-sm text-slate-200"
          >
            <li
              v-for="item in selection.queues.build"
              :key="item"
            >
              • {{ item }}
            </li>
          </ul>
        </div>
        <div class="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2">
          <p class="text-xs uppercase tracking-wide text-slate-400">
            Shipyard
          </p>
          <p
            v-if="!selection.queues.shipyard.length"
            class="text-sm text-slate-500"
          >
            Idle
          </p>
          <ul
            v-else
            class="text-sm text-slate-200"
          >
            <li
              v-for="item in selection.queues.shipyard"
              :key="item"
            >
              • {{ item }}
            </li>
          </ul>
        </div>
      </div>

      <div class="flex gap-2">
        <UButton
          color="primary"
          variant="solid"
          icon="i-lucide-building-2"
          class="flex-1"
        >
          Build
        </UButton>
        <UButton
          color="neutral"
          variant="soft"
          icon="i-lucide-ship"
          class="flex-1"
        >
          Shipyard
        </UButton>
      </div>
    </div>

    <div
      v-else-if="selection && selectionType === 'army' && 'strength' in selection"
      class="space-y-3"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-lg font-semibold text-emerald-200">
            {{ selection.name }}
          </p>
          <p class="text-xs text-slate-400">
            {{ selection.location }}
          </p>
        </div>
        <UBadge
          :color="selection.status === 'idle' ? 'primary' : 'secondary'"
          variant="soft"
          size="xs"
        >
          {{ selection.status === 'idle' ? 'Idle' : `En route ${selection.eta ?? ''}` }}
        </UBadge>
      </div>

      <div class="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2">
        <div class="flex items-center justify-between text-sm text-slate-200">
          <span>Strength</span>
          <span>{{ selection.strength }}</span>
        </div>
      </div>

      <div class="flex gap-2">
        <UButton
          color="primary"
          variant="solid"
          icon="i-lucide-navigation"
          class="flex-1"
        >
          Issue Move Order
        </UButton>
        <UButton
          color="neutral"
          variant="soft"
          icon="i-lucide-rocket"
          class="flex-1"
        >
          Reinforce
        </UButton>
      </div>
    </div>

    <div
      v-else-if="selection && selectionType === 'system' && 'probeStatus' in selection"
      class="space-y-3"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-lg font-semibold text-slate-100">
            {{ selection.name }}
          </p>
          <p class="text-xs text-slate-400">
            Probe: {{ selection.probeStatus }} • Intel: {{ selection.intel }}
          </p>
        </div>
        <UBadge
          color="neutral"
          variant="soft"
          size="xs"
        >
          System
        </UBadge>
      </div>

      <div class="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2">
        <p class="text-xs uppercase tracking-wide text-slate-400">
          Connections
        </p>
        <div class="mt-1 flex flex-wrap gap-1">
          <UBadge
            v-for="item in selection.connections"
            :key="item"
            color="neutral"
            variant="subtle"
            size="xs"
          >
            {{ item }}
          </UBadge>
        </div>
      </div>

      <UButton
        color="neutral"
        variant="solid"
        icon="i-lucide-expand"
        class="w-full"
        @click="emit('update:view-mode', 'system')"
      >
        Open System View
      </UButton>
    </div>

    <div
      v-else-if="selectionType === 'research'"
      class="space-y-3"
    >
      <GameResearchPanel />
    </div>
  </UCard>
</template>
