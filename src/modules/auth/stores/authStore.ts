import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/api/supabase/client'
import type { Session, User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const session = ref<Session | null>(null)
  const user = ref<User | null>(null)
  const loading = ref(true)

  const isAuthenticated = computed(() => !!session.value)

  async function syncProfile() {
    if (!session.value || !user.value) return
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .single()

    const providerToken = session.value.provider_token
    const metadata = user.value.user_metadata

    const profileData = {
      id: user.value.id,
      github_id: metadata.sub || user.value.id,
      username: metadata.user_name || metadata.full_name || profile?.username,
      github_username: metadata.user_name,
      github_avatar_url: metadata.avatar_url,
      // Only update token if we have a fresh one from this session
      ...(providerToken ? { github_token: providerToken } : {})
    }

    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert(profileData)

    if (upsertError) console.error('Error syncing profile:', upsertError)
  }

  let initializationPromise: Promise<void> | null = null

  async function initialize() {
    if (initializationPromise) return initializationPromise

    initializationPromise = (async () => {
      loading.value = true
      try {
        const { data } = await supabase.auth.getSession()
        session.value = data.session
        user.value = data.session?.user ?? null
        
        if (session.value) await syncProfile()
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        loading.value = false
      }

      supabase.auth.onAuthStateChange(async (event, newSession) => {
        session.value = newSession
        user.value = newSession?.user ?? null
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await syncProfile()
        }
      })
    })()

    return initializationPromise
  }


  async function signInWithGithub() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}`,
        scopes: 'repo'
      }
    })
    if (error) throw error
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    session.value = null
    user.value = null
  }

  return {
    session,
    user,
    loading,
    isAuthenticated,
    initialize,
    signInWithGithub,
    signOut
  }
})
