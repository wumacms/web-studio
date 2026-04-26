<template>
  <div class="h-full flex flex-col">
    <div class="p-4 border-b border-gray-800 bg-gray-900/50 sticky top-0 z-10 backdrop-blur-sm">
      <h3 class="text-sm font-bold text-white uppercase tracking-wider mb-1">Library</h3>
      <p class="text-xs text-gray-400">Drag blocks to your canvas</p>
    </div>

    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <div v-if="templateStore.loading" class="space-y-4">
        <div v-for="i in 4" :key="i" class="h-24 bg-gray-800 rounded-xl animate-pulse"></div>
      </div>
      
      <div 
        v-else
        v-for="template in templateStore.availableTemplates" 
        :key="template.id"
        class="group relative bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:border-primary/50 cursor-grab active:cursor-grabbing transition-all hover:shadow-lg hover:shadow-primary/5"
        draggable="true"
        @dragstart="onDragStart($event, template)"
      >
        <!-- Preview Placeholder -->
        <div class="aspect-video bg-gray-950 flex flex-col items-center justify-center p-4">
          <div v-if="template.preview_image" class="w-full h-full">
            <img :src="template.preview_image" class="w-full h-full object-cover rounded shadow" />
          </div>
          <div v-else class="text-center">
            <Layout class="w-8 h-8 text-gray-700 mx-auto mb-2" />
            <span class="text-[10px] text-gray-600 font-mono text-center block px-2">{{ template.name }}</span>
          </div>
        </div>
        
        <!-- Info Overlay -->
        <div class="absolute inset-0 bg-gray-900/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center pointer-events-none">
          <span class="text-sm font-bold text-white mb-1">{{ template.name }}</span>
          <span class="text-[10px] text-gray-400">{{ template.category }}</span>
          <span v-if="template.origin === 'USER'" class="mt-2 text-[8px] bg-primary/20 text-primary px-1.5 py-0.5 rounded uppercase font-black">My Block</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { Layout } from 'lucide-vue-next'
import type { BlockTemplate } from '@/types/models/block'
import { useTemplateStore } from '../../stores/templateStore'

const templateStore = useTemplateStore()

onMounted(() => {
  templateStore.loadEditorTemplates()
})

const onDragStart = (event: DragEvent, template: BlockTemplate) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/json', JSON.stringify(template))
    event.dataTransfer.effectAllowed = 'copy'
  }
}
</script>
