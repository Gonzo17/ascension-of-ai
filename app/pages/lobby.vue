<script setup lang="ts">
type LobbyPlayer = {
  user_id: string
  is_host?: boolean | null
  profiles?: {
    username?: string | null
  } | null
}

type Lobby = {
  id: string
  name: string
  status: 'waiting' | 'started' | 'starting'
  created_at: string
  host_id: string
  host?: {
    username?: string | null
  } | null
  lobby_players?: { count: number | null }[] | null
}

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const toast = useToast()

const lobbies = ref<Lobby[]>([])
const members = ref<LobbyPlayer[]>([])
const myLobbyId = ref<string | null>(null)
const lobbyName = ref('')
const loading = ref(false)
const creating = ref(false)
const joining = ref<string | null>(null)
const playerCounts = ref<Record<string, number>>({})
const hostnames = ref<Record<string, string>>({})
const userIdRef = ref<string | null>(null)
let channel: ReturnType<typeof supabase.channel> | null = null

const hostNameFor = (id: string | null | undefined) => {
  if (!id) return 'Commander'
  const fromMap = hostnames.value[id]
  if (fromMap) return fromMap
  const fromMembers = members.value.find(p => p.user_id === id)?.profiles?.username
  return fromMembers || 'Commander'
}

const currentLobby = computed(() => lobbies.value.find(lobby => lobby.id === myLobbyId.value) ?? null)
const isHost = computed(() => currentLobby.value?.host_id === userIdRef.value)
const memberCount = computed(() => members.value.length)

const getUserId = async (): Promise<string | null> => {
  if (user.value?.id) {
    userIdRef.value = user.value.id
    return user.value.id
  }
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null
  userIdRef.value = data.user.id
  return data.user.id
}

const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    displayError(error)
    return
  }

  if (channel) supabase.removeChannel(channel)
  lobbies.value = []
  members.value = []
  myLobbyId.value = null

  toast.add({
    title: 'Abgemeldet',
    icon: 'i-lucide-log-out',
    color: 'neutral'
  })

  await navigateTo('/login')
}

watchEffect(() => {
  if (!user.value) navigateTo('/')
})

const refreshLobbies = async () => {
  const userId = await getUserId()
  if (!userId) {
    loading.value = false
    return
  }
  loading.value = true

  const { data, error } = await supabase
    .from('lobbies')
    .select('id, name, status, created_at, host_id, lobby_players(count)')
    .order('created_at', { ascending: false })

  if (error) {
    displayError(error)
  } else if (data) {
    lobbies.value = data
    playerCounts.value = Object.fromEntries(data.map(lobby => [lobby.id, lobby.lobby_players?.[0]?.count ?? 0]))

    const { data: membershipData, error: membershipError } = await supabase
      .from('lobby_players')
      .select('lobby_id')
      .eq('user_id', userId)
      .limit(1)

    if (membershipError) {
      displayError(membershipError)
    } else {
      myLobbyId.value = membershipData?.[0]?.lobby_id ?? null
      if (myLobbyId.value) await loadMembers(myLobbyId.value)
      else members.value = []
    }

    const hostIds = Array.from(new Set(data.map(lobby => lobby.host_id).filter(Boolean))) as string[]
    if (hostIds.length) {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', hostIds)

      if (profilesError) displayError(profilesError)
      else hostnames.value = Object.fromEntries(profilesData?.map(p => [p.id, p.username || 'Unbekannt']) || [])
    } else {
      hostnames.value = {}
    }
  } else {
    lobbies.value = []
    playerCounts.value = {}
    hostnames.value = {}
  }

  loading.value = false
}

const loadMembers = async (lobbyId: string) => {
  const { data, error } = await supabase
    .from('lobby_players')
    .select('user_id, is_host')
    .eq('lobby_id', lobbyId)

  if (error) {
    displayError(error)
    return
  }

  const profileIds = data?.map(player => player.user_id) || []
  let nameMap: Record<string, string> = {}
  if (profileIds.length) {
    const { data: profileRows, error: profileError } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', profileIds)

    if (profileError) displayError(profileError)
    else nameMap = Object.fromEntries(profileRows?.map(p => [p.id, p.username || 'Commander']) || [])
  }

  members.value = (data || []).map(player => ({
    ...player,
    profiles: { username: nameMap[player.user_id] || 'Commander' }
  }))
}

const leaveCurrentLobby = async () => {
  const userId = await getUserId()
  if (!userId || !myLobbyId.value) return
  const lobbyId = myLobbyId.value
  const hostId = currentLobby.value?.host_id

  if (isHost.value) {
    const { error } = await supabase.from('lobbies').delete().match({ id: lobbyId, host_id: userId })
    if (error) {
      displayError(error)
      await supabase.from('lobby_players').delete().match({ lobby_id: lobbyId, user_id: userId })
    } else {
      await supabase.from('lobby_players').delete().match({ lobby_id: lobbyId })
      // doppelt sicher: löschen ohne host filter falls oben nichts entfernte
      await supabase.from('lobbies').delete().match({ id: lobbyId })
    }
  } else {
    const { error } = await supabase.from('lobby_players').delete().match({ lobby_id: lobbyId, user_id: userId })
    if (error) displayError(error)
    // falls Lobby nun leer ist: versuchen aufzuräumen
    const { count } = await supabase
      .from('lobby_players')
      .select('*', { count: 'exact', head: true })
      .eq('lobby_id', lobbyId)

    if ((count ?? 0) === 0 && hostId) {
      await supabase.from('lobbies').delete().match({ id: lobbyId, host_id: hostId })
    }
  }

  myLobbyId.value = null
  members.value = []
  lobbies.value = lobbies.value.filter(l => l.id !== lobbyId)
  const { [lobbyId]: _, ...updatedCounts } = playerCounts.value
  playerCounts.value = updatedCounts
  await refreshLobbies()
}

const createLobby = async () => {
  const userId = await getUserId()
  if (!userId) {
    displayError({ message: 'Kein eingeloggter User gefunden. Bitte neu einloggen.' })
    return
  }
  creating.value = true

  const fallbackName = `Crew ${new Date().toLocaleTimeString('en-US', { hour12: false })}`
  const finalName = lobbyName.value.trim() || fallbackName

  const { data, error } = await supabase
    .from('lobbies')
    .insert({ name: finalName, host_id: userId, status: 'waiting' })
    .select()
    .single()

  if (error) {
    displayError(error)
  } else if (data) {
    await supabase.from('lobby_players').upsert({ lobby_id: data.id, user_id: userId, is_host: true })
    myLobbyId.value = data.id
    lobbyName.value = ''
    await refreshLobbies()
  }

  creating.value = false
}

const joinLobby = async (lobbyId: string) => {
  const userId = await getUserId()
  if (!userId) {
    displayError({ message: 'Kein eingeloggter User gefunden. Bitte neu einloggen.' })
    return
  }
  joining.value = lobbyId
  await leaveCurrentLobby()

  const { error } = await supabase
    .from('lobby_players')
    .upsert({ lobby_id: lobbyId, user_id: userId, is_host: false })

  if (error) displayError(error)
  else {
    myLobbyId.value = lobbyId
    await loadMembers(lobbyId)
    await refreshLobbies()
  }

  joining.value = null
}

const startLobby = async () => {
  const userId = await getUserId()
  if (!userId || !currentLobby.value || !isHost.value) return
  const { error } = await supabase
    .from('lobbies')
    .update({ status: 'started', started_at: new Date().toISOString() })
    .eq('id', currentLobby.value.id)
    .eq('host_id', userId)

  if (error) displayError(error)
  else navigateTo('/game')
}

const displayError = (error: { message: string }) => {
  toast.add({
    title: 'Fehler',
    description: error.message,
    color: 'error',
    icon: 'i-lucide-alert-circle'
  })
}

const subscribeRealtime = () => {
  channel = supabase
    .channel('lobby-stream')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'lobbies' }, () => refreshLobbies())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'lobby_players' }, async (payload) => {
      if (payload.new?.lobby_id === myLobbyId.value || payload.old?.lobby_id === myLobbyId.value) {
        await loadMembers(myLobbyId.value!)
      }
      refreshLobbies()
    })
    .subscribe()
}

onMounted(async () => {
  subscribeRealtime()
  const uid = await getUserId()
  if (uid) await refreshLobbies()
})

watch(() => user.value?.id, async (id) => {
  if (id) {
    userIdRef.value = id
    await refreshLobbies()
  }
})

onUnmounted(() => {
  if (channel) supabase.removeChannel(channel)
})

watch(currentLobby, (value) => {
  if (value?.status === 'started') navigateTo('/game')
})
</script>

<template>
  <div class="bg-slate-950 text-white min-h-[calc(100vh-var(--ui-header-height))]">
    <UContainer class="py-12 space-y-8">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="space-y-1">
          <p class="text-sm uppercase tracking-[0.2em] text-emerald-300">
            Lobby
          </p>
          <h1 class="text-3xl font-semibold">
            Finde oder hoste deine AI-Wars Lobby
          </h1>
        </div>
        <div class="flex gap-3">
          <UButton
            icon="i-lucide-user"
            to="/profile"
            color="secondary"
            variant="soft"
          >
            Profil
          </UButton>
          <UButton
            icon="i-lucide-log-out"
            color="neutral"
            variant="soft"
            @click="signOut"
          >
            Logout
          </UButton>
        </div>
      </div>

      <div
        v-if="currentLobby"
        class="grid gap-6 lg:grid-cols-3"
      >
        <UCard class="lg:col-span-2 border-white/10 bg-white/5">
          <template #header>
            <div class="flex items-center justify-between">
              <p class="font-semibold text-white">
                Meine Lobby
              </p>
              <UBadge
                color="primary"
                variant="subtle"
              >
                {{ currentLobby.status }}
              </UBadge>
            </div>
          </template>

          <div class="space-y-4">
            <div class="space-y-1">
              <p class="text-lg font-semibold">
                {{ currentLobby.name }}
              </p>
              <p class="text-sm text-slate-300">
                Host: {{ hostNameFor(currentLobby.host_id) }}
              </p>
              <p class="text-sm text-slate-300">
                Spieler aktuell: {{ memberCount }}
              </p>
            </div>

            <div class="space-y-2">
              <p class="text-sm font-semibold text-white">
                Spieler in der Lobby
              </p>
              <div class="space-y-2">
                <div
                  v-for="player in members"
                  :key="player.user_id"
                  class="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                >
                  <div class="flex items-center gap-2">
                    <span class="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>{{ player.profiles?.username || 'Commander' }}</span>
                  </div>
                  <span
                    v-if="player.is_host"
                    class="text-xs uppercase tracking-wide text-emerald-300"
                  >Host</span>
                </div>
                <p
                  v-if="!members.length"
                  class="text-sm text-slate-300"
                >
                  Wartet noch auf Mitspieler.
                </p>
              </div>
            </div>

            <div class="flex flex-wrap gap-3">
              <UButton
                v-if="isHost"
                color="primary"
                icon="i-lucide-play"
                :disabled="memberCount < 1"
                @click="startLobby"
              >
                Spiel starten
              </UButton>
              <UButton
                v-else
                color="primary"
                variant="soft"
                icon="i-lucide-hourglass"
              >
                Warten auf Host
              </UButton>
              <UButton
                color="secondary"
                variant="ghost"
                icon="i-lucide-log-out"
                @click="leaveCurrentLobby"
              >
                Lobby verlassen
              </UButton>
            </div>
          </div>
        </UCard>

        <UCard class="border-white/10 bg-white/5">
          <template #header>
            <p class="font-semibold text-white">
              Status
            </p>
          </template>
          <div class="space-y-2 text-sm text-slate-200">
            <p>Lobby-ID: {{ currentLobby.id }}</p>
            <p>Host: {{ hostNameFor(currentLobby.host_id) }}</p>
            <p>Spieler: {{ memberCount }}</p>
          </div>
        </UCard>
      </div>

      <div
        v-else
        class="grid gap-6 lg:grid-cols-3"
      >
        <UCard class="lg:col-span-2 border-white/10 bg-white/5">
          <template #header>
            <div class="flex items-center justify-between">
              <p class="font-semibold text-white">
                Offene Lobbys
              </p>
              <span class="text-sm text-slate-200">{{ lobbies.length }} aktiv</span>
            </div>
          </template>

          <div
            v-if="loading"
            class="space-y-3"
          >
            <USkeleton
              v-for="i in 4"
              :key="i"
              class="h-14"
            />
          </div>

          <div
            v-else
            class="space-y-3"
          >
            <div
              v-for="lobby in lobbies"
              :key="lobby.id"
              class="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div class="space-y-1">
                <div class="flex items-center gap-2 text-sm text-emerald-300">
                  <span
                    class="h-2 w-2 rounded-full"
                    :class="lobby.status === 'started' ? 'bg-amber-400' : 'bg-emerald-400'"
                  />
                  {{ lobby.status === 'started' ? 'gestartet' : 'bereit' }}
                </div>
                <p class="text-lg font-semibold">
                  {{ lobby.name }}
                </p>
                <p class="text-sm text-slate-200">
                  Host: {{ hostNameFor(lobby.host_id) }}
                </p>
                <p class="text-sm text-slate-300">
                  Spieler: {{ playerCounts[lobby.id] || 0 }}
                </p>
              </div>
              <div class="flex items-center gap-3">
                <UButton
                  :disabled="lobby.status === 'started'"
                  :loading="joining === lobby.id"
                  color="primary"
                  icon="i-lucide-door-open"
                  @click="joinLobby(lobby.id)"
                >
                  Beitreten
                </UButton>
              </div>
            </div>

            <p
              v-if="!lobbies.length"
              class="text-sm text-slate-300"
            >
              Noch keine Lobbys vorhanden. Erstelle die erste!
            </p>
          </div>
        </UCard>

        <div class="space-y-6">
          <UCard class="border-white/10 bg-white/5">
            <template #header>
              <p class="font-semibold text-white">
                Neue Lobby erstellen
              </p>
            </template>
            <div class="space-y-2 text-white">
              <label class="text-sm font-medium">Lobby-Name</label>
              <p class="text-xs text-slate-300">
                Optional – wird sonst automatisch vergeben
              </p>
              <UInput
                v-model="lobbyName"
                color="primary"
                placeholder="z.B. Night Raid"
              />
              <UButton
                block
                color="primary"
                icon="i-lucide-rocket"
                :loading="creating"
                @click="createLobby"
              >
                Erstellen und beitreten
              </UButton>
            </div>
          </UCard>

          <UCard class="border-white/10 bg-white/5">
            <template #header>
              <p class="font-semibold text-white">
                Status
              </p>
            </template>
            <div class="space-y-2 text-sm text-slate-200">
              <p>Keiner Lobby beigetreten.</p>
              <p>Wähle links eine Lobby oder erstelle eine neue.</p>
            </div>
          </UCard>
        </div>
      </div>
    </UContainer>
  </div>
</template>
