<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'

const props = withDefaults(defineProps<{
  redirectPath?: string
}>(), {
  redirectPath: '/lobby'
})

const supabase = useSupabaseClient()
const toast = useToast()

const sign = ref<'in' | 'up'>('in')

const aiNames = [
  'Ada',
  'Astra',
  'Cortana',
  'Echo',
  'GLaDOS',
  'HAL',
  'Jarvis',
  'Nova',
  'Orion',
  'Sage',
  'Skye',
  'TARS',
  'Vega'
]

const baseFields: AuthFormField[] = [{
  name: 'email',
  type: 'text' as const,
  label: 'Email',
  placeholder: 'Enter your email',
  required: true
}, {
  name: 'password',
  label: 'Password',
  type: 'password' as const,
  placeholder: 'Enter your password'
}]

const fields = computed<AuthFormField[]>(() => {
  if (sign.value === 'up') {
    return [...baseFields, {
      name: 'username',
      label: 'Ingame-Name (optional)',
      type: 'text' as const,
      placeholder: 'z.B. Orion-317'
    }]
  }
  return baseFields
})

const randomSuffix = () => Math.floor(100 + Math.random() * 900)
const generateBaseName = () => `${aiNames[Math.floor(Math.random() * aiNames.length)]}-${randomSuffix()}`

const generateUniqueUsername = async (preferred?: string) => {
  let candidate = preferred?.trim() || generateBaseName()
  for (let i = 0; i < 3; i++) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', candidate)
      .limit(1)
      .maybeSingle()

    if (!error && !data) return candidate
    candidate = preferred?.trim() ? `${preferred.trim()}-${randomSuffix()}` : generateBaseName()
  }
  return candidate
}

const ensureProfile = async (userId: string, desired?: string | null) => {
  const { data: existing } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', userId)
    .maybeSingle()

  const desiredName = desired?.trim()
  if (desiredName && existing?.username === desiredName) return

  let nameToUse: string | undefined = desiredName
  if (!nameToUse) {
    if (existing?.username) return
    nameToUse = await generateUniqueUsername()
  } else if (existing?.username && existing.username === nameToUse) {
    return
  }

  if (!nameToUse) return

  await supabase
    .from('profiles')
    .upsert({ id: userId, username: nameToUse })
}

const providers = [{
  label: 'As Guest',
  icon: 'i-lucide-user-circle',
  onClick: async () => {
    const { error, data } = await supabase.auth.signInAnonymously()
    if (error) {
      displayError(error)
      return
    }

    const uid = data?.user?.id
    if (uid) await ensureProfile(uid, undefined)

    await navigateTo(props.redirectPath)
  }
}]

const signIn = async (email: string, password: string, username?: string | null) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) {
    displayError(error)
    return
  }

  const { data: userData } = await supabase.auth.getUser()
  const uid = userData.user?.id
  if (uid) await ensureProfile(uid, username)

  await supabase.auth.updateUser({
    data: {
      role: 'user'
    }
  })

  await navigateTo(props.redirectPath)
}

const signUp = async (email: string, password: string, username?: string | null) => {
  const { error } = await supabase.auth.signUp({
    email,
    password
  })
  if (error) displayError(error)
  else {
    toast.add({
      title: 'Sign up successful',
      icon: 'i-lucide-check-circle',
      color: 'success'
    })
    await signIn(email, password, username)
  }
}

const onSubmit = async (payload: FormSubmitEvent<{ email: string, password: string, username?: string | null }>) => {
  const email = payload.data.email
  const password = payload.data.password
  const username = payload.data.username

  if (sign.value === 'in') await signIn(email, password)
  else await signUp(email, password, username)
}

const displayError = (error: { message: string }) => {
  toast.add({
    title: 'Error',
    description: error.message,
    icon: 'i-lucide-alert-circle',
    color: 'error'
  })
}
</script>

<template>
  <div class="space-y-3">
    <UAuthForm
      :title="sign === 'in' ? 'Login' : 'Sign up'"
      icon="i-lucide-user"
      :fields="fields"
      :providers="providers"
      @submit="onSubmit"
    >
      <template #description>
        {{ sign === 'up' ? 'Already have an account?' : 'Don\'t have an account?' }}
        <UButton
          variant="link"
          class="p-0"
          @click="sign = sign === 'up' ? 'in' : 'up'"
        >
          {{ sign === 'in' ? 'Sign up' : 'Sign in' }}
        </UButton>.
      </template>
    </UAuthForm>
  </div>
</template>
