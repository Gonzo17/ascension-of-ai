<script setup lang="ts">
const { locales, setLocale, localeProperties } = useI18n()

const items = computed(() =>
  locales.value.map(l => ({
    label: l.name ?? l.code.toUpperCase(),
    code: l.code,
    onSelect: async () => {
      setLocale(l.code)
    }
  }))
)
</script>

<template>
  <UDropdownMenu
    :portal="false"
    :modal="false"
    :items="items"
  >
    <UButton
      variant="ghost"
      size="sm"
      :label="localeProperties.name"
      icon="i-lucide-globe"
    />
  </UDropdownMenu>
</template>
