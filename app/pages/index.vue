<script setup lang="ts">
const { t } = useI18n()
const user = useSupabaseUser()

const features = computed(() => [
  {
    title: t('home.feature-1-title'),
    description: t('home.feature-1-desc'),
    icon: 'i-lucide-rocket'
  },
  {
    title: t('home.feature-2-title'),
    description: t('home.feature-2-desc'),
    icon: 'i-lucide-cpu'
  },
  {
    title: t('home.feature-3-title'),
    description: t('home.feature-3-desc'),
    icon: 'i-lucide-shield'
  }
])
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-white overflow-x-hidden">
    <!-- Language Switch - Top Right -->
    <div class="absolute top-6 right-6 z-30">
      <CommonLanguageSwitch />
    </div>

    <!-- Hero Section with Background -->
    <div class="relative min-h-screen flex items-center justify-center overflow-hidden">
      <!-- Background Image with Overlay -->
      <div class="absolute inset-0 z-0">
        <div
          class="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style="background-image: url('/background1.png')"
        />
        <div class="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/85 to-slate-950 z-10" />
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_60%_30%,rgba(167,139,250,0.1),transparent_50%)] z-10" />
      </div>

      <!-- Hero Content -->
      <UContainer class="relative z-20 py-32 space-y-12">
        <div class="text-center space-y-8 max-w-4xl mx-auto">
          <!-- Main Title -->
          <div class="space-y-4 justify-center items-center flex flex-col">
            <img
              src="/logo.png"
              alt="Ascension of AI logo"
              :width="400"
            >
            <h1 class="text-5xl md:text-7xl font-bold sr-only">
              Ascension of AI
            </h1>
            <p class="text-xl md:text-2xl text-slate-200 font-light">
              {{ t('home.tagline') }}
            </p>
          </div>

          <!-- CTA Section -->
          <div class="pt-8 w-full max-w-md mx-auto">
            <NuxtLink
              v-if="user"
              to="/game"
              as="div"
            >
              <UButton
                icon="i-lucide-arrow-right"
                trailing
                color="primary"
                size="lg"
                class="w-full"
              >
                {{ t('home.cta-button') }}
              </UButton>
            </NuxtLink>
            <UCard
              v-else
              class="bg-slate-800/50 backdrop-blur border-violet-500/30"
            >
              <AuthPanel redirect-path="/lobby" />
            </UCard>
          </div>
        </div>
      </UContainer>
    </div>

    <!-- Features Section -->
    <div class="relative z-10 bg-slate-950 py-20 border-t border-slate-800">
      <UContainer class="space-y-16">
        <div class="text-center space-y-4">
          <h2 class="text-4xl font-bold">
            {{ t('home.features-title') }}
          </h2>
          <p class="text-slate-400 text-lg">
            {{ t('home.features-subtitle') }}
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <UCard
            v-for="feature in features"
            :key="feature.title"
            class="bg-slate-900/50 border-slate-700 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10 transition-all"
          >
            <div class="space-y-3">
              <UIcon
                :name="feature.icon"
                class="w-10 h-10 text-violet-400"
              />
              <h3 class="text-lg font-semibold">
                {{ feature.title }}
              </h3>
              <p class="text-sm text-slate-300">
                {{ feature.description }}
              </p>
            </div>
          </UCard>
        </div>
      </UContainer>
    </div>

    <!-- Screenshots Section (Placeholder) -->
    <div class="relative z-10 bg-slate-950 py-20 border-t border-slate-800">
      <UContainer class="space-y-12">
        <div class="text-center space-y-4">
          <h2 class="text-4xl font-bold">
            {{ t('home.gameplay-title') }}
          </h2>
          <p class="text-slate-400 text-lg">
            {{ t('home.gameplay-subtitle') }}
          </p>
        </div>

        <!-- Screenshot Grid Placeholder -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="i in 3"
            :key="i"
            class="relative group"
          >
            <UCard
              class="bg-slate-900/50 border-slate-700 hover:border-violet-500/50 aspect-video flex items-center justify-center transition-all"
            >
              <UIcon
                name="i-lucide-image"
                class="w-12 h-12 text-slate-600 group-hover:text-slate-400 transition-colors"
              />
            </UCard>
          </div>
        </div>
      </UContainer>
    </div>
  </div>
</template>
