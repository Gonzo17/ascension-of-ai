import type {
  AscensionTier,
  TechDef,
  TechStatus,
  TechLockedReason,
  ActiveResearch
} from '~~/shared/types/research'
import {
  TECH_DEFS,
  ASCENSION_GATES,
  getTechById,
  getTechsByTier
} from '~~/shared/defs/research-tree'
import { ASCENSION_TIER_ORDER } from '~~/shared/types/research'

export const useResearchStore = defineStore('research', () => {
  const isOpen = ref(false)
  const searchQuery = ref('')

  const ascensionTierReached = ref<AscensionTier>('k0.8')
  const computeLevel = ref(5)
  const empireState = ref({
    planetsControlled: 3,
    homeSystemMajority: true,
    intelLevel: 'medium' as 'low' | 'medium' | 'high'
  })

  // Testdaten: Alle K0.6 Technologien erforscht -> erstes Gate (K0.8) erfüllt
  const completedTechIds = ref<string[]>([
    // K0.6 - Alle 6 erforscht
    'tech:bootstrapped-ai-core',
    'tech:basic-industrial-robotics',
    'tech:planetary-grid-management',
    'tech:probe-design',
    'tech:first-shipyard',
    'tech:data-center-i'
  ])

  const activeResearch = ref<ActiveResearch | undefined>({
    techId: 'tech:autonomous-resource-allocation',
    startedAt: Date.now() - 1000 * 60 * 60 * 24 * 365,
    progress: 45
  })

  const allTechs = computed(() => TECH_DEFS)

  const techsByTier = computed(() => {
    const grouped = new Map<AscensionTier, TechDef[]>()
    for (const tier of ASCENSION_TIER_ORDER) {
      grouped.set(tier, getTechsByTier(tier))
    }
    return grouped
  })

  const filteredTechs = computed(() => {
    if (!searchQuery.value.trim()) {
      return allTechs.value
    }
    const query = searchQuery.value.toLowerCase()
    return allTechs.value.filter(tech =>
      tech.name.toLowerCase().includes(query)
      || tech.description?.toLowerCase().includes(query)
      || tech.category.toLowerCase().includes(query)
    )
  })

  const filteredTechsByTier = computed(() => {
    const grouped = new Map<AscensionTier, TechDef[]>()
    for (const tier of ASCENSION_TIER_ORDER) {
      const techs = filteredTechs.value.filter(t => t.tier === tier)
      if (techs.length > 0) {
        grouped.set(tier, techs)
      }
    }
    return grouped
  })

  function isTechCompleted(techId: string): boolean {
    return completedTechIds.value.includes(techId)
  }

  function isTechResearching(techId: string): boolean {
    return activeResearch.value?.techId === techId
  }

  function getTierIndex(tier: AscensionTier): number {
    return ASCENSION_TIER_ORDER.indexOf(tier)
  }

  function isTierUnlocked(tier: AscensionTier): boolean {
    const reachedIndex = getTierIndex(ascensionTierReached.value)
    const targetIndex = getTierIndex(tier)
    return targetIndex <= reachedIndex
  }

  function isTechAvailable(techId: string): boolean {
    if (isTechCompleted(techId) || isTechResearching(techId)) {
      return false
    }
    const reasons = getTechLockedReasons(techId)
    return reasons.length === 0
  }

  function getTechLockedReasons(techId: string): TechLockedReason[] {
    const tech = getTechById(techId)
    if (!tech) return [{ type: 'prerequisite', message: 'Tech not found' }]

    const reasons: TechLockedReason[] = []

    for (const prereqId of tech.prerequisites) {
      if (!isTechCompleted(prereqId)) {
        const prereq = getTechById(prereqId)
        reasons.push({
          type: 'prerequisite',
          message: `Requires: ${prereq?.name ?? prereqId}`,
          value: prereqId
        })
      }
    }

    if (!isTierUnlocked(tech.tier)) {
      reasons.push({
        type: 'ascension',
        message: `Requires Ascension to ${tech.tier}`,
        value: tech.tier
      })
    }

    if (tech.requires?.compute && computeLevel.value < tech.requires.compute) {
      reasons.push({
        type: 'compute',
        message: `Requires Compute Level ${tech.requires.compute}`,
        value: computeLevel.value,
        required: tech.requires.compute
      })
    }

    if (tech.requires?.empire) {
      const req = tech.requires.empire
      if (req.planetsControlled && empireState.value.planetsControlled < req.planetsControlled) {
        reasons.push({
          type: 'empire',
          message: `Requires ${req.planetsControlled} planets controlled`,
          value: empireState.value.planetsControlled,
          required: req.planetsControlled
        })
      }
      if (req.homeSystemMajority && !empireState.value.homeSystemMajority) {
        reasons.push({
          type: 'empire',
          message: 'Requires home system majority'
        })
      }
      if (req.intelLevel) {
        const intelOrder = ['low', 'medium', 'high']
        const currentIndex = intelOrder.indexOf(empireState.value.intelLevel)
        const requiredIndex = intelOrder.indexOf(req.intelLevel)
        if (currentIndex < requiredIndex) {
          reasons.push({
            type: 'empire',
            message: `Requires ${req.intelLevel} intel level`,
            value: empireState.value.intelLevel,
            required: req.intelLevel
          })
        }
      }
    }

    return reasons
  }

  function getTechStatus(techId: string): TechStatus {
    if (isTechCompleted(techId)) return 'completed'
    if (isTechResearching(techId)) return 'researching'
    if (isTechAvailable(techId)) return 'available'
    return 'locked'
  }

  function canAscend(toTier: AscensionTier): boolean {
    const gate = ASCENSION_GATES.find(g => g.toTier === toTier)
    if (!gate) return false

    const prevTierIndex = getTierIndex(toTier) - 1
    if (prevTierIndex < 0) return true
    const prevTier = ASCENSION_TIER_ORDER[prevTierIndex]!
    if (getTierIndex(ascensionTierReached.value) < getTierIndex(prevTier)) {
      return false
    }

    for (const techId of gate.requiresTech) {
      if (!isTechCompleted(techId)) return false
    }

    if (computeLevel.value < gate.requiresCompute) return false

    if (gate.requiresEmpire) {
      const req = gate.requiresEmpire
      if (req.planetsControlled && empireState.value.planetsControlled < req.planetsControlled) {
        return false
      }
      if (req.homeSystemMajority && !empireState.value.homeSystemMajority) {
        return false
      }
      if (req.intelLevel) {
        const intelOrder = ['low', 'medium', 'high']
        if (intelOrder.indexOf(empireState.value.intelLevel) < intelOrder.indexOf(req.intelLevel)) {
          return false
        }
      }
    }

    return true
  }

  function getAscensionGateStatus(toTier: AscensionTier) {
    const gate = ASCENSION_GATES.find(g => g.toTier === toTier)
    if (!gate) return null

    const techProgress = gate.requiresTech.map(techId => ({
      techId,
      tech: getTechById(techId),
      completed: isTechCompleted(techId)
    }))

    const computeMet = computeLevel.value >= gate.requiresCompute

    let empireMet = true
    const empireDetails: Array<{ requirement: string, met: boolean }> = []

    if (gate.requiresEmpire) {
      const req = gate.requiresEmpire
      if (req.planetsControlled) {
        const met = empireState.value.planetsControlled >= req.planetsControlled
        empireMet = empireMet && met
        empireDetails.push({
          requirement: `${req.planetsControlled} planets`,
          met
        })
      }
      if (req.homeSystemMajority) {
        const met = empireState.value.homeSystemMajority
        empireMet = empireMet && met
        empireDetails.push({
          requirement: 'Home system majority',
          met
        })
      }
      if (req.intelLevel) {
        const intelOrder = ['low', 'medium', 'high']
        const met = intelOrder.indexOf(empireState.value.intelLevel) >= intelOrder.indexOf(req.intelLevel)
        empireMet = empireMet && met
        empireDetails.push({
          requirement: `${req.intelLevel} intel`,
          met
        })
      }
    }

    return {
      gate,
      techProgress,
      computeRequired: gate.requiresCompute,
      computeCurrent: computeLevel.value,
      computeMet,
      empireDetails,
      empireMet,
      canAscend: canAscend(toTier),
      alreadyAscended: getTierIndex(ascensionTierReached.value) >= getTierIndex(toTier)
    }
  }

  function startResearch(techId: string) {
    if (!isTechAvailable(techId)) return false
    if (activeResearch.value) return false

    activeResearch.value = {
      techId,
      startedAt: Date.now(),
      progress: 0
    }
    return true
  }

  function cancelResearch() {
    activeResearch.value = undefined
  }

  function completeResearch() {
    if (!activeResearch.value) return
    completedTechIds.value.push(activeResearch.value.techId)
    activeResearch.value = undefined
  }

  function tickProgress(deltaPercent: number = 5) {
    if (!activeResearch.value) return
    activeResearch.value.progress = Math.min(100, activeResearch.value.progress + deltaPercent)
    if (activeResearch.value.progress >= 100) {
      completeResearch()
    }
  }

  function ascendToTier(tier: AscensionTier) {
    if (!canAscend(tier)) return false
    ascensionTierReached.value = tier
    return true
  }

  function open() {
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  function toggle() {
    isOpen.value = !isOpen.value
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  return {
    isOpen,
    searchQuery,
    ascensionTierReached,
    computeLevel,
    empireState,
    completedTechIds,
    activeResearch,

    allTechs,
    techsByTier,
    filteredTechs,
    filteredTechsByTier,

    isTechCompleted,
    isTechResearching,
    isTechAvailable,
    getTechLockedReasons,
    getTechStatus,
    isTierUnlocked,

    canAscend,
    getAscensionGateStatus,

    startResearch,
    cancelResearch,
    completeResearch,
    tickProgress,
    ascendToTier,

    open,
    close,
    toggle,
    setSearchQuery
  }
})
