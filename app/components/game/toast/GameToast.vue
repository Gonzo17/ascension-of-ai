<script setup lang="ts">
const props = defineProps<{
  toast: GameToast
}>()

const emit = defineEmits<{
  (e: 'click' | 'dismiss'): void
}>()

const { t } = useI18n()
const { translateParams } = useTranslateParams()

const icon = computed(() => eventTypeIcons[props.toast.event.type])
const severityStyles = computed(() => eventSeverityStyles[props.toast.event.severity])

const title = computed(() => t(props.toast.event.titleKey, translateParams(props.toast.event.titleParams)))
const description = computed(() => t(props.toast.event.descriptionKey, translateParams(props.toast.event.descriptionParams)))

// Progress bar for auto-dismiss toasts
const progress = ref(100)
let progressInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  if (!props.toast.requiresDismiss && props.toast.duration > 0) {
    const stepTime = 50 // Update every 50ms
    const steps = props.toast.duration / stepTime
    const stepAmount = 100 / steps

    progressInterval = setInterval(() => {
      progress.value = Math.max(0, progress.value - stepAmount)
    }, stepTime)
  }
})

onUnmounted(() => {
  if (progressInterval) {
    clearInterval(progressInterval)
  }
})
</script>

<template>
  <div
    class="relative w-80 rounded-lg border bg-neutral-900/95 backdrop-blur-sm shadow-lg cursor-pointer overflow-hidden transition-all hover:scale-[1.02]"
    :class="[severityStyles.border, severityStyles.glow]"
    @click="emit('click')"
  >
    <!-- Scan line effect -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="absolute inset-0 bg-linear-to-b from-transparent via-info-500/5 to-transparent animate-scan" />
    </div>

    <!-- Content -->
    <div class="relative flex items-start gap-3 p-4">
      <!-- Icon -->
      <div
        class="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-neutral-800/80 border border-neutral-700/50"
      >
        <UIcon
          :name="icon"
          class="w-5 h-5"
          :class="severityStyles.icon"
        />
      </div>

      <!-- Text -->
      <div class="flex-1 min-w-0 pr-6">
        <p class="text-sm font-semibold text-neutral-100 truncate">
          {{ title }}
        </p>
        <p class="text-xs text-neutral-400 truncate mt-0.5">
          {{ description }}
        </p>
      </div>

      <!-- Close button (for requiresDismiss) -->
      <button
        v-if="toast.requiresDismiss"
        class="absolute top-2 right-2 p-1 rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700/50 transition-colors"
        @click.stop="emit('dismiss')"
      >
        <UIcon
          name="i-lucide-x"
          class="w-4 h-4"
        />
      </button>
    </div>

    <!-- Progress bar (for auto-dismiss) -->
    <div
      v-if="!toast.requiresDismiss"
      class="absolute bottom-0 left-0 h-0.5 bg-linear-to-r from-info-500 to-success-500 transition-all duration-50"
      :style="{ width: `${progress}%` }"
    />

    <!-- Corner accent -->
    <div class="absolute top-0 right-0 w-8 h-8 overflow-hidden">
      <div
        class="absolute -top-4 -right-4 w-8 h-8 rotate-45"
        :class="severityStyles.border.replace('/50', '/30')"
      />
    </div>
  </div>
</template>

<style scoped>
@keyframes scan {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
}

.animate-scan {
  animation: scan 2s linear infinite;
}
</style>
