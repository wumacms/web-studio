<template>
  <div class="fixed inset-0 z-[200] flex items-center justify-center p-6">
    <div class="absolute inset-0 bg-gray-950/90 backdrop-blur-xl" @click="$emit('close')"></div>
    
    <div class="bg-gray-900 border border-primary/30 w-full max-w-2xl rounded-[40px] p-12 relative shadow-[0_0_100px_rgba(var(--primary-rgb),0.2)] overflow-hidden">
      <!-- Background Glow -->
      <div class="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[80px] rounded-full animate-pulse"></div>
      
      <div v-if="step === 'input'" class="relative z-10">
        <div class="flex items-center gap-3 mb-8">
          <div class="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/40">
            <Wand2 class="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 class="text-3xl font-black text-white tracking-tight">Magic Builder</h2>
            <p class="text-gray-400 text-sm">Describe your dream website and let AI do the rest.</p>
          </div>
        </div>

        <div class="space-y-6">
          <div>
            <label class="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Website Description</label>
            <textarea 
              v-model="userPrompt"
              rows="4"
              placeholder="e.g. A modern landing page for a coffee shop in Paris with a minimalist vibe and a focus on community."
              class="w-full bg-gray-950 border border-gray-800 rounded-2xl px-6 py-4 text-white focus:border-primary focus:outline-none transition-all text-lg leading-relaxed shadow-inner"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <button 
              @click="userPrompt = 'A professional portfolio for a digital artist specializing in 3D characters.'"
              class="p-4 bg-gray-800 hover:bg-gray-700 rounded-xl text-left transition-colors group"
            >
              <p class="text-[10px] text-gray-500 uppercase font-black mb-1 group-hover:text-primary transition-colors">Portfolio</p>
              <p class="text-xs text-gray-300">Digital Artist Portfolio</p>
            </button>
            <button 
              @click="userPrompt = 'A sleek landing page for a new productivity app called TaskFlow.'"
              class="p-4 bg-gray-800 hover:bg-gray-700 rounded-xl text-left transition-colors group"
            >
              <p class="text-[10px] text-gray-500 uppercase font-black mb-1 group-hover:text-primary transition-colors">SaaS</p>
              <p class="text-xs text-gray-300">Productivity App Landing</p>
            </button>
          </div>
        </div>

        <button 
          @click="startGeneration"
          :disabled="!userPrompt || loading"
          class="w-full mt-10 py-5 bg-primary text-white font-black text-xl rounded-2xl shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <Sparkles class="w-6 h-6" />
          Generate My Website
        </button>
      </div>

      <div v-else-if="step === 'generating'" class="relative z-10 py-20 text-center">
        <div class="relative w-32 h-32 mx-auto mb-10">
          <div class="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div class="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <Wand2 class="w-12 h-12 text-primary animate-bounce" />
          </div>
        </div>
        
        <h3 class="text-2xl font-black text-white mb-4 animate-pulse">{{ currentStatus }}</h3>
        <p class="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
          Our AI is picking the best blocks and writing tailored copy for your brand.
        </p>
        
        <div class="mt-12 flex justify-center gap-1">
          <div v-for="i in 3" :key="i" class="w-2 h-2 bg-primary rounded-full animate-bounce" :style="{ animationDelay: `${i * 0.2}s` }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Wand2, Sparkles } from 'lucide-vue-next'
import { aiApi } from '@/api/endpoints/ai.api'
import { siteTemplateApi } from '@/api/endpoints/site-template.api'
import { supabase } from '@/api/supabase/client'

const router = useRouter()

const userPrompt = ref('')
const loading = ref(false)
const step = ref<'input' | 'generating'>('input')
const currentStatus = ref('Analyzing prompt...')

const startGeneration = async () => {
  loading.value = true
  step.value = 'generating'
  
  try {
    // 1. Generate Structure and Content
    currentStatus.value = 'Picking the perfect template...'
    const aiResult = await aiApi.generateSiteStructure(userPrompt.value)
    
    // 2. Create Site from Template with AI Content
    currentStatus.value = 'Designing your pages...'
    
    // Fetch GitHub Token if available
    let token = ''
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('github_token')
        .eq('id', user.id)
        .single()
      token = data?.github_token || ''
    }

    const siteId = await siteTemplateApi.createSiteFromTemplate(
      aiResult.templateId, 
      `AI: ${userPrompt.value.slice(0, 20)}...`,
      token,
      aiResult.content
    )
    
    currentStatus.value = 'Finalizing details...'
    router.push(`/site/${siteId}/dashboard`)
  } catch (error) {
    alert('Magic failed. Please try again.')
    step.value = 'input'
  } finally {
    loading.value = false
  }
}
</script>
