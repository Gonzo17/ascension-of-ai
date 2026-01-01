<script setup lang="ts">
const props = defineProps<{
  resources: Array<GameResource>
  research: { name: string, yearsLeft: number }
  armies: Array<GameArmy>
  planets: Array<GamePlanet>
  systems: Array<GameSolarSystem>
}>()

const emit = defineEmits<{
  (e: 'select-army' | 'select-planet', id: string): void
  (e: 'open-research' | 'end-year'): void
}>()
</script>

<template>
  <UCard
    color="neutral"
    variant="solid"
    class="border border-slate-800 bg-slate-900/80 backdrop-blurn"
  >
    <div class="flex flex-col gap-8">
      <div class="grid grid-cols-3 gap-2">
        <UCard
          v-for="resource in props.resources"
          :key="resource.key"
          color="neutral"
          variant="soft"
          class="border border-slate-800 bg-slate-900/70"
          :ui="{ body: 'py-2 sm:py-2' }"
        >
          <UIcon
            :name="`i-lucide-${resource.icon}`"
            class="text-xs mr-1"
            :class="resource.accent"
          />
          <span class="text-slate-400 text-sm">{{ resource.label }}</span>

          <div class="flex items-center justify-between text-sm">
            <p
              class="mt-0 text-lg font-semibold text-slate-200"
            >
              {{ resource.amount.toLocaleString('en-US') }}
            </p>
            <UBadge
              variant="subtle"
              size="sm"
            >
              {{ resource.delta }}
            </UBadge>
          </div>
        </UCard>
      </div>

      <UButton
        class="relative overflow-hidden rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 w-full text-left transition hover:border-cyan-500 hover:bg-slate-900"
        @click="emit('open-research')"
      >
        <UIcon
          size="24"
          class="text-secondary"
          name="i-lucide-flask-conical"
        />

        <!-- Progress background -->
        <div
          class="absolute inset-y-0 left-0 bg-secondary-500/20 transition-all duration-500"
          :style="{ width: 50 + '%' }"
        />

        <!-- Content -->
        <div class="relative z-10 flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-wide text-slate-400">
              Active Research
            </p>
            <p class="text-sm font-semibold text-violet-200">
              {{ props.research.name }}
            </p>
            <p class="text-xs text-slate-400">
              {{ props.research.yearsLeft }}y remaining
            </p>
          </div>
        </div>
      </UButton>

      <UCollapsible class="flex flex-col gap-2 w-full">
        <UButton
          :label="`Planets (${props.planets.length})`"
          icon="i-lucide-earth"
          color="neutral"
          variant="ghost"
          trailing-icon="i-lucide-chevron-down"
          block
        />
        <template
          #content
        >
          <div
            class="space-y-2"
          >
            <button
              v-for="planet in props.planets"
              :key="planet.id"
              class="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-left transition hover:border-cyan-500 hover:bg-slate-900"
              @click="emit('select-planet', planet.id)"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-slate-200">{{ planet.name }}</span>
                </div>
                <UBadge
                  :color="planet.queues.build.length === 0 ? 'primary' : 'secondary'"
                  variant="soft"
                  size="sm"
                >
                  {{ planet.queues.build.length === 0 ? 'Idle' : `Building ${planet.queues.build[0]}` }}
                </UBadge>
              </div>
              <div class="flex items-center justify-between text-xs text-slate-400">
                <span>{{ planet.type }}</span>
                <span>Buildings: {{ planet.buildings.length }}</span>
              </div>
            </button>
          </div>
        </template>
      </UCollapsible>

      <UCollapsible class="flex flex-col gap-2 w-full">
        <UButton
          :label="`Armies (${props.armies.length})`"
          icon="i-lucide-rocket"
          color="neutral"
          variant="ghost"
          trailing-icon="i-lucide-chevron-down"
          block
        />
        <template
          #content
        >
          <div
            class="space-y-2"
          >
            <button
              v-for="army in props.armies"
              :key="army.id"
              class="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-left transition hover:border-cyan-500 hover:bg-slate-900"
              @click="emit('select-army', army.id)"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-slate-200">{{ army.name }}</span>
                </div>
                <UBadge
                  :color="army.status === 'idle' ? 'primary' : 'secondary'"
                  variant="soft"
                  size="sm"
                >
                  {{ army.status === 'idle' ? 'Idle' : `En route ${army.eta ?? ''}` }}
                </UBadge>
              </div>
              <div class="flex items-center justify-between text-xs text-slate-400">
                <span>{{ army.location }}</span>
                <span>Strength {{ army.strength }}</span>
              </div>
            </button>
          </div>
        </template>
      </UCollapsible>
    </div>
  </UCard>
</template>
