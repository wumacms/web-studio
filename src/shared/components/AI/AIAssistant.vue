<template>
  <div class="bg-gray-950 border border-primary/30 rounded-xl p-4 shadow-2xl shadow-primary/10 mb-6">
    <div class="flex items-center gap-2 mb-3">
      <Sparkles class="w-4 h-4 text-primary animate-pulse" />
      <span class="text-xs font-bold text-white uppercase tracking-widest">AI Copywriter</span>
    </div>

    <!-- Error Message Display -->
    <div v-if="errorMsg" class="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-400">
      {{ errorMsg }}
    </div>
    
    <div class="space-y-3">
      <textarea 
        v-model="prompt"
        rows="2"
        placeholder="Describe what you want to write..."
        class="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:border-primary focus:outline-none transition-colors"
      ></textarea>
      
      <div class="flex items-center gap-2">
        <button 
          @click="handleGenerate"
          :disabled="!prompt || loading"
          class="flex-1 py-2 bg-primary text-white text-[10px] font-black uppercase rounded-lg disabled:opacity-30 flex items-center justify-center gap-2"
        >
          <Loader2 v-if="loading" class="w-3 h-3 animate-spin" />
          {{ loading ? 'Generating...' : 'Generate Content' }}
        </button>
        <button 
          @click="prompt = ''"
          class="p-2 text-gray-500 hover:text-white transition-colors"
        >
          <RotateCcw class="w-3 h-3" />
        </button>
      </div>
    </div>
    
    <div v-if="result" class="mt-4 p-3 bg-gray-900 rounded-lg border border-gray-800 relative group flex flex-col gap-3">
      <div class="text-xs text-gray-300 leading-relaxed overflow-x-auto">
        <pre v-if="isJson" class="font-mono text-[10px] whitespace-pre-wrap">{{ JSON.stringify(JSON.parse(result), null, 2) }}</pre>
        <p v-else>{{ result }}</p>
      </div>
      
      <button 
        @click="$emit('apply', result)"
        class="w-full py-2 bg-primary/20 hover:bg-primary text-primary hover:text-white border border-primary/30 rounded-lg transition-all flex items-center justify-center gap-2 text-[10px] font-bold uppercase"
      >
        <Check class="w-3 h-3" />
        Apply Changes
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Sparkles, Loader2, RotateCcw, Check } from 'lucide-vue-next'
import { aiApi } from '@/api/endpoints/ai.api'

const props = defineProps<{
  context?: string
}>()

const emit = defineEmits(['apply'])

const prompt = ref('')
const loading = ref(false)
const result = ref('')
const errorMsg = ref('')

const isJson = computed(() => {
  try {
    JSON.parse(result.value)
    return true
  } catch (e) {
    return false
  }
})

const handleGenerate = async () => {
  console.log('handleGenerate triggered')
  loading.value = true
  errorMsg.value = ''
  try {
    const text = await aiApi.generateContent(prompt.value, props.context || '')
    result.value = text
  } catch (error: any) {
    console.error('AI Assistant Error:', error)
    errorMsg.value = error.message || 'Failed to generate content'
    alert('AI Error: ' + errorMsg.value)
  } finally {
    loading.value = false
  }
}
</script>
