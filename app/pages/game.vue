<template>
  <div class="h-screen bg-neutral-950 text-neutral-100 flex flex-col overflow-hidden">
    <!-- Toast Container -->
    <GameToastContainer />

    <GameTopBar
      :year="year"
      :unread-event-count="eventLogStore.unreadCount"
      :resources="resources"
      :research="research"
      @toggle-event-log="eventLogStore.toggle"
      @open-research="researchStore.toggle"
    />

    <!-- Full-screen Map Container -->
    <div class="relative flex-1 overflow-hidden">
      <GameCanvas
        :view-mode="viewMode"
        :selected-type="selectedType"
        :selected-id="selectedId!"
        :planets="planets"
        :systems="systems"
        @select-planet="(id: string) => setSelection('planet', id)"
        @select-system="(id: string) => setSelection('system', id)"
        @update:view-mode="handleViewModeChange"
      />

      <!-- Event Log Overlay -->
      <GameEventLogCenter
        v-if="eventLogStore.isOpen"
        @close="eventLogStore.close"
        @navigate-to="handleEventNavigate"
      />

      <!-- Research Tree Overlay -->
      <GameResearchTreeGraph
        v-if="researchStore.isOpen"
        @close="researchStore.close"
      />

      <!-- End Turn Button (hidden when dialogs are open) -->
      <GameEndTurnButton v-if="!eventLogStore.isOpen && !researchStore.isOpen" />
    </div>
  </div>
</template>

<script setup lang="ts">
type SelectionType = 'planet' | 'army' | 'system' | 'research'

// Local UI types (different from backend types)
interface GameResource {
  key: string
  label: string
  amount: number
  delta: string
  accent: string
  icon: string
}

interface GameSolarSystem {
  id: string
  name: string
  probeStatus: string
  intel: string
  connections: string[]
  location: { x: number, y: number }
}

interface GamePlanet {
  id: string
  systemId: string
  name: string
  owner: string
  type: string
  buildings: string[]
  queues: { build: string[], shipyard: string[] }
  location: { x: number, y: number }
}

definePageMeta({
  title: 'Ascension of AI',
  layout: false
})

const year = ref(2245)
const viewMode = ref<'galaxy' | 'system'>('galaxy')
const selectedType = ref<SelectionType>('planet')
const selectedId = ref<string | undefined>('p-aurora')

const eventLogStore = useEventLogStore()
const researchStore = useResearchStore()

// Initialize mock data on mount
onMounted(() => {
  if (eventLogStore.events.length === 0) {
    eventLogStore.initMockData(year.value)
  }

  // TODO: Remove - Demo toasts for testing
  setTimeout(() => {
    eventLogStore.addEvent({
      type: 'research-complete',
      severity: 'success',
      year: year.value,
      titleKey: 'events.types.research-complete.title',
      titleParams: { name: 'Plasma Drives' },
      descriptionKey: 'events.types.research-complete.description',
      descriptionParams: { location: 'Aurora Prime' },
      details: [
        { labelKey: 'events.details.research-time', value: '3', valueParams: { count: 3 }, icon: 'i-lucide-clock' },
        { labelKey: 'events.details.unlocks', value: 'Advanced Thrusters', icon: 'i-lucide-unlock' }
      ],
      relatedEntityId: 'p-aurora',
      relatedEntityType: 'planet'
    })
  }, 500)

  setTimeout(() => {
    eventLogStore.addEvent({
      type: 'combat',
      severity: 'warning',
      year: year.value,
      titleKey: 'events.types.combat.title',
      titleParams: { location: 'Nadir Gate' },
      descriptionKey: 'events.types.combat.description',
      descriptionParams: { outcome: 'events.values.victory' },
      details: [
        { labelKey: 'events.details.enemy-losses', value: '8', valueParams: { count: 8 }, icon: 'i-lucide-skull' },
        { labelKey: 'events.details.our-losses', value: '2', valueParams: { count: 2 }, icon: 'i-lucide-heart-crack' }
      ],
      relatedEntityId: 's-nadir',
      relatedEntityType: 'system'
    })
  }, 800)

  setTimeout(() => {
    eventLogStore.addEvent({
      type: 'discovery',
      severity: 'info',
      year: year.value,
      titleKey: 'events.types.discovery.title',
      titleParams: {},
      descriptionKey: 'events.types.discovery.description',
      descriptionParams: { name: 'Omega Nebula' },
      details: [
        { labelKey: 'events.details.system-name', value: 'Omega Nebula', icon: 'i-lucide-star' },
        { labelKey: 'events.details.intel-level', value: 'Low', icon: 'i-lucide-eye' }
      ]
    })
  }, 2500)
})

const handleEventNavigate = (entityType: string, entityId: string) => {
  setSelection(entityType as SelectionType, entityId)
  eventLogStore.close()
}

const { t } = useI18n()

const resources = computed((): GameResource[] => [
  { key: 'energy', label: t('game.resources.energy'), amount: 1260, delta: '+15', accent: 'text-warning-300', icon: 'zap' },
  { key: 'material', label: t('game.resources.material'), amount: 880, delta: '+7', accent: 'text-neutral-300', icon: 'wrench' },
  { key: 'rare', label: t('game.resources.rare'), amount: 210, delta: '+1', accent: 'text-primary-300', icon: 'gem' }
])

const research = ref({ id: 'quantum-lattice', yearsLeft: 2, progress: 45 })

const systems = ref<GameSolarSystem[]>([
  { id: 's-lyra', name: 'Lyra-7', probeStatus: 'scanned', intel: 'high', connections: ['Nadir Gate', 'Helios Fringe'], location: { x: 22, y: 35 } },
  { id: 's-nadir', name: 'Nadir Gate', probeStatus: 'charted', intel: 'medium', connections: ['Lyra-7', 'Aster Drift'], location: { x: 58, y: 48 } },
  { id: 's-helix', name: 'Helios Fringe', probeStatus: 'ping-only', intel: 'low', connections: ['Lyra-7'], location: { x: 42, y: 68 } }
])

const planets = ref<GamePlanet[]>([
  {
    id: 'p-aurora',
    systemId: 's-lyra',
    name: 'Aurora Prime',
    owner: 'Terran Union',
    type: 'Terran Core',
    buildings: ['Fusion Core', 'Orbital Dock', 'Hydroponics'],
    queues: { build: ['Hab Complex (2y)'], shipyard: ['Frigate Hull (3y)'] },
    location: { x: 28, y: 44 }
  },
  {
    id: 'p-borealis',
    systemId: 's-lyra',
    name: 'Borealis',
    owner: 'Terran Union',
    type: 'Ice World',
    buildings: ['Refinery Node', 'Listening Post'],
    queues: { build: ['Refinery Upgrade (1y)'], shipyard: [] },
    location: { x: 52, y: 62 }
  },
  {
    id: 'p-nadir-outpost',
    systemId: 's-nadir',
    name: 'Nadir Outpost',
    owner: 'Unclaimed',
    type: 'Rocky',
    buildings: ['Landing Pad'],
    queues: { build: [], shipyard: [] },
    location: { x: 74, y: 38 }
  }
])

const setSelection = (type: SelectionType, id?: string) => {
  selectedType.value = type
  selectedId.value = id
}

const handleViewModeChange = (mode: 'galaxy' | 'system') => {
  viewMode.value = mode
}
</script>
