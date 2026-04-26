<template>
  <div class="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-10">
        <div class="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/40 mx-auto mb-6">
          <span class="text-white font-bold text-3xl">W</span>
        </div>
        <h1 class="text-3xl font-extrabold text-white mb-2">Welcome to Web Studio</h1>
        <p class="text-gray-400">The world's most powerful AI-driven visual website builder.</p>
      </div>

      <div class="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
        <p class="text-sm text-gray-400 text-center mb-8">
          Join thousands of creators and start building today.
        </p>
        
        <button 
          @click="handleSignIn"
          class="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-gray-100 text-gray-950 font-bold rounded-2xl transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl shadow-white/5"
        >
          <Github class="w-6 h-6" />
          Continue with GitHub
        </button>

        <div class="mt-8 pt-8 border-t border-gray-800 text-center">
          <p class="text-xs text-gray-500">
            By continuing, you agree to our <a href="#" class="text-gray-400 hover:underline">Terms of Service</a> and <a href="#" class="text-gray-400 hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Github } from 'lucide-vue-next'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()

const handleSignIn = async () => {
  try {
    await authStore.signInWithGithub()
  } catch (error) {
    console.error('Sign in failed:', error)
  }
}
</script>
