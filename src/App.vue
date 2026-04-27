<template>
  <div 
    class="flex flex-col bg-gray-950 text-gray-100 font-sans selection:bg-primary selection:text-white"
    :class="route.name === 'editor' ? 'h-screen overflow-hidden' : 'min-h-screen'"
  >

    <header v-if="!route.path.startsWith('/preview')" class="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50 flex-none">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2 cursor-pointer" @click="$router.push('/')">
          <div class="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
            <span class="text-white font-bold text-xl">W</span>
          </div>
          <span class="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Web Studio
          </span>
        </div>
        
        <nav v-if="authStore.isAuthenticated" class="hidden md:flex items-center gap-8">
          <router-link to="/" class="text-sm font-medium text-gray-400 hover:text-white transition-colors">Sites</router-link>
          <router-link to="/marketplace/block" class="text-sm font-medium text-gray-400 hover:text-white transition-colors">Marketplace</router-link>
          <router-link to="/admin/templates" class="text-sm font-medium text-gray-400 hover:text-white transition-colors">Templates</router-link>

        </nav>

        <div class="flex items-center gap-4">
          <template v-if="!authStore.isAuthenticated">
            <button 
              @click="handleSignIn"
              class="px-4 py-2 text-sm font-medium bg-gray-800 hover:bg-gray-700 rounded-full transition-all border border-gray-700 flex items-center gap-2"
            >
              <Github class="w-4 h-4" />
              Sign In with GitHub
            </button>
          </template>
          <template v-else>
            <div class="flex items-center gap-3">
              <img 
                v-if="authStore.user?.user_metadata?.avatar_url" 
                :src="authStore.user.user_metadata.avatar_url" 
                class="w-8 h-8 rounded-full border border-gray-700"
              />
              <span class="text-sm font-medium text-gray-300 hidden sm:inline">
                {{ authStore.user?.user_metadata?.user_name || authStore.user?.email }}
              </span>
              <button 
                @click="handleSignOut"
                class="p-2 text-gray-400 hover:text-red-400 transition-colors"
                title="Sign Out"
              >
                <LogOut class="w-5 h-5" />
              </button>
            </div>
          </template>
        </div>
      </div>
    </header>

    <main 
      class="flex-1 relative" 
      :class="{ 'min-h-0': route.name === 'editor', 'overflow-y-auto': route.name === 'editor' }"
    >

      <router-view v-slot="{ Component }">
        <transition 
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-4"
          mode="out-in"
        >
          <component :is="Component" :key="$route.fullPath" />
        </transition>
      </router-view>
    </main>

    <footer v-if="route.name !== 'editor' && !route.path.startsWith('/preview')" class="border-t border-gray-800 py-12 bg-gray-950 flex-none">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
        <div class="flex items-center gap-2 grayscale opacity-50">
          <div class="w-6 h-6 bg-gray-400 rounded flex items-center justify-center">
            <span class="text-gray-950 font-bold text-xs">W</span>
          </div>
          <span class="text-sm font-semibold tracking-tight text-gray-400">Web Studio</span>
        </div>
        <p class="text-sm text-gray-500">
          &copy; 2024 Web Studio AI. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/modules/auth/stores/authStore'
import { LogOut, Github } from 'lucide-vue-next'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// Watch authentication state to handle redirects after OAuth login
watch(() => authStore.isAuthenticated, (isAuth) => {
  if (isAuth && route.path === '/login') {
    router.push('/')
  }
}, { immediate: true })

const handleSignIn = async () => {
  try {
    await authStore.signInWithGithub()
  } catch (error) {
    console.error('Sign in failed:', error)
  }
}

const handleSignOut = async () => {
  try {
    await authStore.signOut()
    router.push('/login')
  } catch (error) {
    console.error('Sign out failed:', error)
  }
}
</script>

<style>
/* Custom animations or global styles can go here if needed */
</style>
