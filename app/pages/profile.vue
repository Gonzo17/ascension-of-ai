<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const toast = useToast()

const loading = ref(false)
const form = reactive({
  username: ''
})

const getUserId = async (): Promise<string | null> => {
  if (user.value?.id) return user.value.id
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null
  return data.user.id
}

watchEffect(() => {
  if (user.value === null) navigateTo('/')
})

const loadProfile = async () => {
  const userId = await getUserId()
  if (!userId) {
    displayError({ message: 'Benutzer nicht gefunden. Bitte melde dich erneut an.' })
    return
  }

  loading.value = true
  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', userId)
    .maybeSingle()

  if (error) displayError(error)
  form.username = data?.username || ''
  loading.value = false
}

const saveProfile = async () => {
  const userId = await getUserId()
  if (!userId) return
  loading.value = true

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, username: form.username.trim() || 'Commander' })

  if (error) displayError(error)
  else {
    toast.add({
      title: 'Profil gespeichert',
      description: 'Dein Ingame-Name wurde aktualisiert.',
      color: 'success',
      icon: 'i-lucide-check-circle'
    })
  }

  loading.value = false
}

const displayError = (error: { message: string }) => {
  toast.add({
    title: 'Fehler',
    description: error.message,
    color: 'error',
    icon: 'i-lucide-alert-circle'
  })
}

onMounted(loadProfile)
</script>

<template>
  <div class="bg-slate-950 text-white min-h-[calc(100vh-var(--ui-header-height))]">
    <UContainer class="py-12">
      <div class="mb-8 space-y-2">
        <p class="text-sm uppercase tracking-[0.2em] text-emerald-300">
          Profil
        </p>
        <h1 class="text-3xl font-semibold">
          Ingame-Name anpassen
        </h1>
        <p class="text-slate-300">
          Der Name wird in Lobbys und später im Spiel angezeigt.
        </p>
      </div>

      <UCard class="max-w-xl border-white/10 bg-white/5">
        <template #header>
          <p class="font-semibold text-white">
            Dein Profil
          </p>
        </template>

        <div class="space-y-6">
          <UFormGroup
            label="Ingame-Name"
            class="text-white"
            help="Wird allen Spielern angezeigt."
          >
            <UInput
              v-model="form.username"
              color="primary"
              placeholder="Commander Nova"
              :loading="loading"
            />
          </UFormGroup>

          <div class="flex flex-wrap gap-3">
            <UButton
              color="primary"
              icon="i-lucide-save"
              :loading="loading"
              @click="saveProfile"
            >
              Speichern
            </UButton>
            <UButton
              color="info"
              variant="ghost"
              icon="i-lucide-refresh-cw"
              :loading="loading"
              @click="loadProfile"
            >
              Neu laden
            </UButton>
            <UButton
              color="secondary"
              variant="soft"
              icon="i-lucide-arrow-left"
              to="/lobby"
            >
              Zur Lobby
            </UButton>
          </div>
        </div>
      </UCard>
    </UContainer>
  </div>
</template>
