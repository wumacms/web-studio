<template>
  <div class="fixed inset-0 z-[200] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-gray-950/80 backdrop-blur-md" @click="$emit('close')"></div>
    <div class="bg-gray-900 border border-gray-800 w-full max-w-xl rounded-[32px] p-8 relative shadow-2xl overflow-hidden">
      <!-- Background Glow -->
      <div class="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[80px] rounded-full"></div>
      
      <div class="relative">
        <div class="flex items-center gap-4 mb-8">
          <div class="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center">
            <Github class="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 class="text-2xl font-bold text-white">Publish to GitHub Pages</h2>
            <p class="text-gray-400 text-sm">Deploy your site as a professional static website.</p>
          </div>
        </div>

        <!-- Initial Form -->
        <div v-if="status === 'idle'" class="space-y-6">
          <div v-if="!token" class="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-start gap-4 mb-6">
            <AlertCircle class="w-6 h-6 text-yellow-500 shrink-0" />
            <div>
              <h4 class="text-yellow-500 font-bold text-sm mb-1">GitHub Authorization Required</h4>
              <p class="text-xs text-gray-400 leading-relaxed mb-3">We need your permission to create repositories and host your site. Please sign in again to authorize repo access.</p>
              <button @click="reauthorize" class="px-4 py-2 bg-yellow-500 text-black font-bold text-xs rounded-lg hover:bg-yellow-400 transition-all">Authorize GitHub</button>
            </div>
          </div>

          <div v-else class="p-6 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-4 mb-6">
            <div class="w-10 h-10 bg-gray-800 rounded-full overflow-hidden border-2 border-green-500/30">
              <img :src="githubAvatar" alt="Avatar" class="w-full h-full object-cover" />
            </div>
            <div class="flex-1">
              <h4 class="text-green-500 font-bold text-sm">Authorized as @{{ githubUsername }}</h4>
              <p class="text-[10px] text-gray-500">Using secure token from your profile</p>
            </div>
            <CheckCircle class="w-5 h-5 text-green-500" />
          </div>

          <div class="space-y-2">
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest">Repository Name</label>
            <div class="relative">
              <input 
                v-model="repoName" 
                readonly
                class="w-full bg-gray-950/50 border border-gray-800 rounded-xl px-4 py-3 text-gray-400 focus:outline-none cursor-not-allowed font-mono text-sm" 
              />
              <Lock class="absolute right-4 top-3.5 w-4 h-4 text-gray-700" />
            </div>
            <p class="text-[10px] text-gray-500">
              {{ isFirstPublish ? 'Auto-generated repository name. It cannot be changed after first publish.' : 'This site is linked to this repository.' }}
            </p>
          </div>

          <div class="flex gap-4 pt-4">
            <button @click="$emit('close')" class="flex-1 py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-2xl transition-all">Cancel</button>
            <button 
              @click="handleDeploy" 
              :disabled="!token || !repoName"
              class="flex-1 py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
            >
              Start Deployment
            </button>
          </div>
        </div>

        <!-- Deployment Progress -->
        <div v-else-if="status === 'deploying'" class="py-12 flex flex-col items-center text-center">
          <div class="relative mb-8">
            <div class="w-20 h-20 border-4 border-gray-800 border-t-primary rounded-full animate-spin"></div>
            <Rocket class="absolute inset-0 m-auto w-8 h-8 text-white animate-pulse" />
          </div>
          <h3 class="text-xl font-bold text-white mb-2">{{ progressTitle }}</h3>
          <p class="text-gray-400 text-sm max-w-xs">{{ progressDesc }}</p>
          
          <!-- Step List -->
          <div class="mt-10 w-full space-y-4">
            <div v-for="(step, i) in steps" :key="i" class="flex items-center gap-3 text-sm">
              <CheckCircle v-if="step.done" class="w-4 h-4 text-green-500" />
              <div v-else-if="step.active" class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <Circle v-else class="w-4 h-4 text-gray-700" />
              <span :class="step.active || step.done ? 'text-gray-200 font-medium' : 'text-gray-600'">{{ step.label }}</span>
            </div>
          </div>
        </div>

        <!-- Success Screen -->
        <div v-else-if="status === 'success'" class="py-6 text-center">
          <div class="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check class="w-10 h-10" />
          </div>
          <h3 class="text-2xl font-bold text-white mb-2">Blast Off!</h3>
          <p class="text-gray-400 mb-8">Your site has been successfully published to GitHub Pages.</p>
          
          <div class="space-y-3 mb-10">
            <a :href="result.pagesUrl" target="_blank" class="flex items-center justify-between p-4 bg-gray-950 border border-gray-800 rounded-2xl hover:border-primary group transition-all">
              <div class="text-left">
                <div class="text-[10px] font-bold text-gray-500 uppercase">Live Site</div>
                <div class="text-sm text-white font-medium">{{ result.pagesUrl }}</div>
              </div>
              <ExternalLink class="w-5 h-5 text-gray-600 group-hover:text-primary" />
            </a>
            <a :href="result.repoUrl" target="_blank" class="flex items-center justify-between p-4 bg-gray-950 border border-gray-800 rounded-2xl hover:border-white group transition-all">
              <div class="text-left">
                <div class="text-[10px] font-bold text-gray-500 uppercase">GitHub Repository</div>
                <div class="text-sm text-white font-medium">{{ result.repoUrl }}</div>
              </div>
              <Github class="w-5 h-5 text-gray-600 group-hover:text-white" />
            </a>
          </div>

          <button @click="$emit('close')" class="w-full py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-2xl transition-all">Done</button>
        </div>

        <!-- Error Screen -->
        <div v-else-if="status === 'error'" class="py-12 text-center">
          <div class="w-20 h-20 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle class="w-10 h-10" />
          </div>
          <h3 class="text-xl font-bold text-white mb-2">Deployment Failed</h3>
          <p class="text-gray-400 mb-8">{{ errorMessage }}</p>
          <button @click="status = 'idle'" class="w-full py-4 bg-primary text-white font-bold rounded-2xl transition-all">Try Again</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Github, Rocket, CheckCircle, Circle, Check, ExternalLink, AlertCircle, Lock } from 'lucide-vue-next'
import { githubPagesService, slugify } from '../services/githubPagesService'
import { supabase } from '@/api/supabase/client'
import { useAuthStore } from '../../auth/stores/authStore'

const props = defineProps<{
  siteId: string
  siteName: string
}>()

const emit = defineEmits(['close'])
const authStore = useAuthStore()

const token = ref('')
const githubUsername = ref('')
const githubAvatar = ref('')
const repoName = ref('')
const status = ref<'idle' | 'deploying' | 'success' | 'error'>('idle')
const errorMessage = ref('')
const result = ref({ pagesUrl: '', repoUrl: '' })

const isFirstPublish = computed(() => !authStore.user || !repoName.value)

onMounted(async () => {
  if (!authStore.user) return
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('github_token, github_username, github_avatar_url')
    .eq('id', authStore.user.id)
    .single()
  
  const { data: site } = await supabase
    .from('sites')
    .select('repo_name')
    .eq('id', props.siteId)
    .single()

  if (profile) {
    token.value = profile.github_token || ''
    githubUsername.value = profile.github_username || ''
    githubAvatar.value = profile.github_avatar_url || ''
  }

  if (site?.repo_name) {
    repoName.value = site.repo_name
  } else {
    repoName.value = slugify(props.siteName)
  }
})

const reauthorize = () => {
  authStore.signInWithGithub()
}

const steps = ref([
  { label: 'Generating static files', active: false, done: false },
  { label: 'Creating GitHub repository', active: false, done: false },
  { label: 'Uploading project files', active: false, done: false },
  { label: 'Enabling GitHub Pages', active: false, done: false }
])

const progressTitle = computed(() => {
  const activeStep = steps.value.find(s => s.active)
  return activeStep ? activeStep.label + '...' : 'Deploying...'
})

const progressDesc = computed(() => 'Please wait while we push your project to GitHub.')

const handleDeploy = async () => {
  status.value = 'deploying'
  
  try {
    // Step 1: Generate
    steps.value[0].active = true
    await githubPagesService.generateFiles(props.siteId)
    steps.value[0].active = false
    steps.value[0].done = true

    // Step 2, 3 & 4: Integrated Deploy
    const deployResult = await githubPagesService.deploy(
      props.siteId, 
      token.value, 
      repoName.value,
      (step) => {
        if (step === 'creating-repo') {
          steps.value[1].active = true
        } else if (step === 'pushing-files') {
          steps.value[1].active = false
          steps.value[1].done = true
          steps.value[2].active = true
        } else if (step === 'enabling-pages') {
          steps.value[2].active = false
          steps.value[2].done = true
          steps.value[3].active = true
        }
      }
    )
    
    // Finalize UI
    steps.value[3].active = false
    steps.value[3].done = true
    
    result.value = deployResult
    status.value = 'success'
  } catch (error: any) {
    status.value = 'error'
    errorMessage.value = error.message || 'An unexpected error occurred during deployment.'
    console.error('Deployment error:', error)
  }
}
</script>
