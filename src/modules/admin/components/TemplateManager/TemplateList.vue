<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
      <div>
        <h1 class="text-4xl font-extrabold tracking-tight text-white mb-2">
          Block Templates
        </h1>
        <p class="text-gray-400 text-lg">
          Create and manage reusable blocks for your web projects.
        </p>
      </div>
      <div class="flex gap-4">
        <button 
          @click="showAiGenerator = true"
          class="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-primary border border-primary/20 font-bold rounded-xl shadow-xl transition-all hover:bg-primary hover:text-white active:scale-95"
        >
          <Sparkles class="w-5 h-5" />
          AI 助手
        </button>
        <button 
          @click="$router.push('/admin/templates/new')"
          class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus class="w-5 h-5" />
          New Template
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="templates.length === 0" 
      class="bg-gray-900/50 border-2 border-dashed border-gray-800 rounded-3xl py-20 px-4 text-center"
    >
      <div class="w-20 h-20 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <LayoutTemplate class="w-10 h-10 text-gray-500" />
      </div>
      <h3 class="text-xl font-bold text-white mb-2">No templates yet</h3>
      <p class="text-gray-400 mb-8 max-w-md mx-auto">
        Start building your reusable block library.
      </p>
      <button @click="$router.push('/admin/templates/new')" class="text-primary font-bold hover:underline flex items-center gap-2 justify-center mx-auto">
        <Plus class="w-4 h-4" /> Create First Template
      </button>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      <div v-for="tpl in templates" :key="tpl.id" 
        class="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-primary/5 duration-300"
      >
        <div class="aspect-video bg-gray-800 relative overflow-hidden group/thumb flex items-center justify-center">
          <div v-if="tpl.preview_image" class="absolute inset-0 bg-cover bg-center" :style="{ backgroundImage: `url(${tpl.preview_image})` }"></div>
          <LayoutTemplate v-else class="w-12 h-12 text-gray-700 group-hover:text-primary transition-colors" />
          
          <div class="absolute inset-0 bg-gray-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <button 
              @click="$router.push(`/admin/templates/${tpl.id}`)"
              class="p-3 bg-white text-gray-950 rounded-xl shadow-xl transform scale-90 group-hover:scale-100 transition-all duration-300 hover:bg-primary hover:text-white"
            >
              <Edit3 class="w-5 h-5" />
            </button>
            <button 
              @click="handleDelete(tpl.id)"
              class="p-3 bg-white text-red-500 rounded-xl shadow-xl transform scale-90 group-hover:scale-100 transition-all duration-300 hover:bg-red-500 hover:text-white"
            >
              <Trash2 class="w-5 h-5" />
            </button>
          </div>

          <div class="absolute top-4 left-4">
            <span class="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded bg-gray-950/80 text-gray-300 backdrop-blur-sm border border-white/10">
              {{ tpl.category || 'General' }}
            </span>
          </div>

          <div v-if="tpl.is_published" class="absolute top-4 right-4">
            <div class="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
          </div>
        </div>

        <div class="p-6">
          <h3 class="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
            {{ tpl.name }}
          </h3>
          <div class="flex items-center justify-between pt-4 border-t border-gray-800">
             <span class="text-[10px] text-gray-500 font-mono">ID: {{ tpl.id.slice(0, 8) }}...</span>
             <span class="text-[10px] text-gray-500">{{ new Date(tpl.created_at!).toLocaleDateString() }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- AI Generator Modal -->
    <AiTemplateGenerator 
      v-if="showAiGenerator" 
      @close="showAiGenerator = false" 
      @saved="fetchTemplates"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, LayoutTemplate, Edit3, Trash2, Sparkles } from 'lucide-vue-next'
import { templateApi } from '@/api/endpoints/template.api'
import type { BlockTemplate } from '@/types/models/block'
import AiTemplateGenerator from './AiTemplateGenerator.vue'

const showAiGenerator = ref(false)

const templates = ref<BlockTemplate[]>([])
const loading = ref(true)

const fetchTemplates = async () => {
  try {
    loading.value = true
    templates.value = await templateApi.getMyTemplates()
  } catch (error) {
    console.error('Failed to fetch templates:', error)
  } finally {
    loading.value = false
  }
}

const handleDelete = async (id: string) => {
  if (!confirm('Are you sure you want to delete this template?')) return
  try {
    await templateApi.deleteTemplate(id)
    templates.value = templates.value.filter(t => t.id !== id)
  } catch (error) {
    alert('Failed to delete template.')
  }
}

onMounted(fetchTemplates)
</script>
