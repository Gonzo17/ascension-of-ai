<script setup lang="ts">
const features = [
  {
    title: 'Sofort loslegen',
    description: 'Jump in as Commander or Guest und starte ohne Ladebalken.',
    icon: 'i-lucide-rocket'
  },
  {
    title: 'Gemeinsam bauen',
    description: 'Bau Schiffe, teile Forschung und buffe dein Squad in Echtzeit.',
    icon: 'i-lucide-wrench'
  },
  {
    title: 'Fair Matchmaking',
    description: 'Hosts starten erst, wenn alle ready sind – keine Rage-Starts.',
    icon: 'i-lucide-shield'
  }
]

const steps = [
  'Login oder Gast-Boost zünden',
  'Einer Crew joinen oder selbst hosten',
  'Launch drücken und zu /game springen'
]
</script>

<template>
  <div class="ai-hero text-white">
    <UContainer class="relative min-h-[calc(100vh-var(--ui-header-height))] py-16 space-y-14">
      <div class="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_60%_30%,rgba(255,255,255,0.06),transparent_35%)]" />

      <div class="grid items-center gap-10 lg:grid-cols-2">
        <div class="space-y-6">
          <div class="inline-flex items-center gap-2 rounded-full px-3 py-1 neon-chip shadow-lg">
            <span class="h-2 w-2 rounded-full bg-emerald-300" />
            AI Wars Sandbox
          </div>
          <div class="space-y-4">
            <h1 class="text-4xl font-semibold tracking-tight md:text-5xl">
              Willkommen, Commander.
            </h1>
            <p class="text-slate-100 text-lg leading-relaxed">
              Forme dein Squad, droppe in Lobbys und starte Gefechte gegen andere Crews. Weniger Bürokratie,
              mehr Laser.
            </p>
          </div>
          <div class="grid gap-3 sm:grid-cols-3">
            <UCard
              v-for="feature in features"
              :key="feature.title"
              class="feature-tile"
            >
              <div class="flex items-start gap-2">
                <UIcon
                  :name="feature.icon"
                  class="h-5 w-5 text-emerald-300"
                />
                <div class="space-y-1">
                  <p class="font-semibold text-white">
                    {{ feature.title }}
                  </p>
                  <p class="text-sm text-slate-200">
                    {{ feature.description }}
                  </p>
                </div>
              </div>
            </UCard>
          </div>
        </div>

        <UCard
          id="play"
          class="glass-card text-white border border-cyan-300/30"
        >
          <div class="mb-6 space-y-2">
            <p class="text-sm font-semibold text-emerald-300">
              Starte dein Drop
            </p>
            <h2 class="text-2xl font-semibold">
              Login, Signup oder Guest Boost
            </h2>
            <p class="text-slate-200">
              Nach dem Login schicken wir dich direkt in die nächste Lobby.
            </p>
          </div>
          <AuthPanel redirect-path="/lobby" />
        </UCard>
      </div>

      <UCard class="glass-card border border-emerald-400/20">
        <div class="grid gap-10 md:grid-cols-2">
          <div class="space-y-3">
            <p class="text-sm uppercase tracking-[0.2em] text-emerald-300">
              Ablauf
            </p>
            <h3 class="text-2xl font-semibold">
              Drei Schritte zum Gefecht
            </h3>
            <p class="text-slate-100">
              Supabase liefert Auth, Lobby-Streams und Realtime; du bringst die Strategie.
            </p>
          </div>
          <div class="space-y-3">
            <div
              v-for="(step, index) in steps"
              :key="step"
              class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur"
            >
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-lg font-semibold text-white shadow-lg">
                {{ index + 1 }}
              </div>
              <p class="text-slate-100">
                {{ step }}
              </p>
            </div>
          </div>
        </div>
      </UCard>
    </UContainer>
  </div>
</template>
