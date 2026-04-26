<template>
  <div class="fixed inset-0 z-[200] flex items-center justify-center p-6">
    <div class="absolute inset-0 bg-gray-950/90 backdrop-blur-md" @click="$emit('close')"></div>
    
    <div class="bg-gray-900 border border-gray-800 w-full max-w-3xl rounded-3xl p-8 relative shadow-2xl flex flex-col max-h-[80vh]">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl font-bold text-white">Select Image</h2>
        <button @click="$emit('close')" class="text-gray-500 hover:text-white transition-colors">
          <X class="w-6 h-6" />
        </button>
      </div>

      <div class="flex gap-4 mb-8">
        <div class="relative flex-1">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            v-model="searchQuery" 
            @keyup.enter="handleSearch"
            placeholder="Search Unsplash (e.g. coffee, tech, nature)..." 
            class="w-full bg-gray-950 border border-gray-800 rounded-xl pl-12 pr-4 py-3 text-white focus:border-primary focus:outline-none"
          />
        </div>
        <button 
          @click="handleSearch"
          :disabled="loading"
          class="px-6 py-3 bg-primary text-white font-bold rounded-xl disabled:opacity-30"
        >
          {{ loading ? 'Searching...' : 'Search' }}
        </button>
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar pr-2">
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div 
            v-for="url in images" 
            :key="url"
            @click="$emit('select', url)"
            class="aspect-square bg-gray-800 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all relative group"
          >
            <img :src="url" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Check class="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { X, Search, Check } from 'lucide-vue-next'
import { aiApi } from '@/api/endpoints/ai.api'

const emit = defineEmits(['close', 'select'])

const searchQuery = ref('')
const loading = ref(false)
const images = ref<string[]>([])

const handleSearch = async () => {
  if (!searchQuery.value) return
  loading.value = true
  try {
    images.value = await aiApi.searchImages(searchQuery.value)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #374151;
  border-radius: 10px;
}
</style>
