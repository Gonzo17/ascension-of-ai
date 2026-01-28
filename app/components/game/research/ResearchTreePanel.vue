<script setup lang="ts">
import type { AscensionTier } from '~~/shared/types/research'
import { ASCENSION_TIER_ORDER, ASCENSION_TIER_LABELS, RESEARCH_CATEGORY_COLORS, RESEARCH_CATEGORY_ICONS } from '~~/shared/types/research'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const store = useResearchStore()
const scrollContainer = ref<HTMLElement | null>(null)

const visibleTiers = computed(() => {
  const tiers: AscensionTier[] = []
  for (const tier of ASCENSION_TIER_ORDER) {
    const techs = store.filteredTechsByTier.get(tier)
    if (techs && techs.length > 0) {
      tiers.push(tier)
    }
  }
  return tiers.reverse()
})

const highlightedTechId = ref<string | null>(null)

const handleStartResearch = (techId: string) => {
  store.startResearch(techId)
}

const handleAscend = (tier: AscensionTier) => {
  store.ascendToTier(tier)
}

const handleHighlightPrereq = (techId: string) => {
  highlightedTechId.value = techId
}

const handleClearHighlight = () => {
  highlightedTechId.value = null
}

const scrollToCurrentTier = () => {
  const tierElement = document.getElementById(`tier-${store.ascensionTierReached}`)
  if (tierElement && scrollContainer.value) {
    tierElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

const categoryLegend = computed(() => {
  return Object.entries(RESEARCH_CATEGORY_COLORS).map(([key, color]) => ({
    key,
    label: key.replace('_', ' / '),
    color,
    icon: RESEARCH_CATEGORY_ICONS[key as keyof typeof RESEARCH_CATEGORY_ICONS]
  }))
})
</script>

<template>
  <div class="absolute inset-0 z-30 flex items-center justify-center p-8 overflow-hidden">
    <!-- Backdrop -->
    <div
      class="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm"
      @click="emit('close')"
    />

    <!-- Panel -->
    <div class="relative w-full max-w-5xl max-h-[calc(100%-4rem)] flex flex-col rounded-lg border border-info-500/30 bg-neutral-900/95 shadow-lg shadow-info-500/10 overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-neutral-700/50">
        <div class="flex items-center gap-3">
          <UIcon
            name="i-lucide-git-branch"
            class="w-5 h-5 text-info-400"
          />
          <h2 class="text-lg font-semibold text-neutral-100">
            Forschungsbaum
          </h2>
          <UBadge
            color="info"
            variant="subtle"
            size="sm"
          >
            {{ ASCENSION_TIER_LABELS[store.ascensionTierReached] }}
          </UBadge>
        </div>
        <div class="flex items-center gap-2">
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            size="sm"
            @click="emit('close')"
          />
        </div>
      </div>

      <!-- Controls -->
      <div class="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-neutral-700/50">
        <!-- Search -->
        <UInput
          :model-value="store.searchQuery"
          icon="i-lucide-search"
          placeholder="Technologie suchen..."
          size="sm"
          class="w-64"
          @update:model-value="store.setSearchQuery($event)"
        />

        <!-- Jump to Current Tier -->
        <UButton
          icon="i-lucide-locate"
          color="neutral"
          variant="soft"
          size="sm"
          @click="scrollToCurrentTier"
        >
          Zur aktuellen Stufe
        </UButton>

        <!-- Spacer -->
        <div class="flex-1" />

        <!-- Current Research Info -->
        <div
          v-if="store.activeResearch"
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-info-500/10 border border-info-500/30"
        >
          <UIcon
            name="i-lucide-flask-conical"
            class="w-4 h-4 text-info-400"
          />
          <span class="text-sm text-info-300">
            {{ store.allTechs.find(t => t.id === store.activeResearch?.techId)?.name }}
          </span>
          <UProgress
            :model-value="store.activeResearch.progress"
            color="info"
            size="xs"
            class="w-16"
          />
          <span class="text-xs text-neutral-400">{{ store.activeResearch.progress }}%</span>
        </div>

        <!-- Stats -->
        <div class="flex items-center gap-3 text-xs text-neutral-500">
          <div class="flex items-center gap-1">
            <UIcon
              name="i-lucide-cpu"
              class="w-3 h-3"
            />
            <span>Compute: {{ store.computeLevel }}</span>
          </div>
          <div class="flex items-center gap-1">
            <UIcon
              name="i-lucide-globe"
              class="w-3 h-3"
            />
            <span>{{ store.empireState.planetsControlled }} Planeten</span>
          </div>
        </div>
      </div>

      <!-- Legend (Collapsible) -->
      <details class="px-5 py-2 border-b border-neutral-700/50">
        <summary class="text-xs text-neutral-500 cursor-pointer hover:text-neutral-400">
          Kategorien-Legende
        </summary>
        <div class="flex flex-wrap gap-2 mt-2 pb-1">
          <div
            v-for="cat in categoryLegend"
            :key="cat.key"
            class="flex items-center gap-1.5"
          >
            <div
              class="w-4 h-4 rounded flex items-center justify-center"
              :class="`bg-${cat.color}-500/20`"
            >
              <UIcon
                :name="cat.icon"
                class="w-2.5 h-2.5"
                :class="`text-${cat.color}-400`"
              />
            </div>
            <span class="text-xs text-neutral-400 capitalize">{{ cat.label }}</span>
          </div>
        </div>
      </details>

      <!-- Tech Tree Content (Bottom to Top) -->
      <div
        ref="scrollContainer"
        class="flex-1 overflow-y-auto p-5"
      >
        <div class="space-y-2">
          <template
            v-for="(tier, tierIndex) in visibleTiers"
            :key="tier"
          >
            <!-- Ascension Gate (between tiers, shown BEFORE the tier in reversed order) -->
            <GameResearchAscensionGate
              v-if="tierIndex > 0"
              :to-tier="tier"
              @ascend="handleAscend"
            />

            <!-- Tier Section -->
            <section
              :id="`tier-${tier}`"
              class="scroll-mt-4"
            >
              <!-- Tier Header -->
              <div class="flex items-center gap-3 mb-4">
                <div
                  class="w-2 h-2 rounded-full"
                  :class="store.isTierUnlocked(tier) ? 'bg-info-500' : 'bg-neutral-700'"
                />
                <h3 class="text-sm font-semibold text-neutral-300 uppercase tracking-wider">
                  {{ ASCENSION_TIER_LABELS[tier] }}
                </h3>
                <div class="flex-1 h-px bg-neutral-700/50" />
                <UBadge
                  v-if="tier === store.ascensionTierReached"
                  color="info"
                  variant="subtle"
                  size="xs"
                >
                  Aktuell
                </UBadge>
                <UBadge
                  v-else-if="!store.isTierUnlocked(tier)"
                  color="neutral"
                  variant="subtle"
                  size="xs"
                >
                  <UIcon
                    name="i-lucide-lock"
                    class="w-3 h-3 mr-1"
                  />
                  Gesperrt
                </UBadge>
              </div>

              <!-- Tech Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                <GameResearchTechCard
                  v-for="tech in store.filteredTechsByTier.get(tier)"
                  :key="tech.id"
                  :tech="tech"
                  :status="store.getTechStatus(tech.id)"
                  :locked-reasons="store.getTechLockedReasons(tech.id)"
                  :progress="store.activeResearch?.techId === tech.id ? store.activeResearch.progress : undefined"
                  :highlighted="highlightedTechId === tech.id"
                  @start-research="handleStartResearch"
                  @highlight-prereq="handleHighlightPrereq"
                  @clear-highlight="handleClearHighlight"
                />
              </div>
            </section>
          </template>

          <!-- Empty State -->
          <div
            v-if="visibleTiers.length === 0"
            class="flex flex-col items-center justify-center py-12 text-neutral-500"
          >
            <UIcon
              name="i-lucide-search-x"
              class="w-10 h-10 mb-3"
            />
            <p class="text-sm">
              Keine Technologien gefunden
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
