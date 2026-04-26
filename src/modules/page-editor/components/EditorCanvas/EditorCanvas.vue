<template>
  <div class="h-full flex overflow-hidden">
    <!-- Left: Block Library -->
    <aside class="w-72 border-r border-gray-800 bg-gray-900 overflow-y-auto">
      <BlockLibrary />
    </aside>

    <!-- Center: Canvas Area -->
    <main 
      class="flex-1 bg-gray-950 overflow-y-auto p-8 flex flex-col items-center custom-scrollbar min-h-0 relative"
      @dragover.prevent="onDragOver"
      @drop.prevent="onDrop"
    >
      <!-- Top Bar -->
      <div class="w-full max-w-5xl mb-6 flex items-center justify-between flex-none">
        <div class="flex items-center gap-4">
          <button 
            @click="$router.push(`/site/${siteId}/dashboard`)"
            class="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft class="w-5 h-5" />
          </button>
          
          <div class="h-6 w-px bg-gray-800 mx-2"></div>

          <!-- Undo/Redo -->
          <div class="flex items-center gap-1">
            <button @click="editorStore.undo" :disabled="!editorStore.canUndo" class="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white disabled:opacity-20 transition-all">
              <Undo2 class="w-4 h-4" />
            </button>
            <button @click="editorStore.redo" :disabled="!editorStore.canRedo" class="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white disabled:opacity-20 transition-all">
              <Redo2 class="w-4 h-4" />
            </button>
          </div>

          <div class="h-6 w-px bg-gray-800 mx-2"></div>

          <!-- Locale Switcher -->
          <div v-if="editorStore.availableLocales.length > 1" class="flex items-center bg-gray-900 border border-gray-800 rounded-lg p-1">
            <button 
              v-for="lang in editorStore.availableLocales" 
              :key="lang"
              @click="editorStore.setLocale(lang)"
              :class="[
                'px-2 py-1 text-[10px] font-black uppercase rounded transition-all',
                editorStore.currentLocale === lang ? 'bg-primary text-white' : 'text-gray-500 hover:text-white'
              ]"
            >
              {{ lang }}
            </button>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="flex items-center bg-gray-900 border border-gray-800 rounded-lg p-1 mr-4">
            <button class="p-1.5 bg-gray-800 rounded-md text-white"><Monitor class="w-4 h-4" /></button>
            <button class="p-1.5 hover:bg-gray-800 rounded-md text-gray-400 transition-colors"><Smartphone class="w-4 h-4" /></button>
          </div>
          <button @click="openPreview" class="p-2 text-gray-400 hover:text-white transition-colors" title="Preview"><Eye class="w-5 h-5" /></button>
          <button @click="handleSave" :disabled="!editorStore.isDirty || editorStore.loading" class="px-4 py-2 bg-primary disabled:opacity-30 text-white text-sm font-bold rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
            <Save v-if="!editorStore.loading" class="w-4 h-4" />
            <Loader2 v-else class="w-4 h-4 animate-spin" />
            {{ editorStore.loading ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>

      <!-- Main Canvas -->
      <div class="w-full max-w-5xl min-h-full bg-white editor-canvas-reset rounded-xl shadow-2xl shadow-black/50 relative group/canvas border-4 border-transparent transition-colors flex-none" :class="{ 'border-primary/50': isDraggingOver }">
        <div v-if="editorStore.sortedBlocks.length === 0 && !editorStore.loading" class="absolute inset-0 flex flex-col items-center justify-center p-12 text-center pointer-events-none">
          <div class="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-6 transform rotate-12 transition-transform group-hover/canvas:rotate-0"><Plus class="w-10 h-10 text-gray-300" /></div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Your Canvas is Empty</h2>
          <p class="text-gray-400 max-w-xs mx-auto">Drag blocks from the left sidebar and drop them here.</p>
        </div>
        <div v-if="editorStore.loading && editorStore.sortedBlocks.length === 0" class="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px] z-10"><Loader2 class="w-8 h-8 text-primary animate-spin" /></div>
        <div class="divide-y-0">
          <BlockRenderer v-for="block in editorStore.sortedBlocks" :key="block.id" :block="block" :is-selected="editorStore.selectedBlockId === block.id" @select="editorStore.selectBlock" @delete="editorStore.removeBlock" @move="handleMove(block.id, $event)" />
        </div>
      </div>
      <!-- Spacer for bottom padding in scroll -->
      <div class="h-24 w-full flex-none"></div>
    </main>

    <!-- Right: Property Panel -->
    <aside class="w-80 border-l border-gray-800 bg-gray-900 overflow-y-auto"><PropsPanel /></aside>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useEditorStore } from '../../stores/editorStore'
import { Plus, Monitor, Smartphone, Save, ChevronLeft, Loader2, Eye, Undo2, Redo2 } from 'lucide-vue-next'
import BlockLibrary from '../BlockLibrary/BlockLibrary.vue'
import BlockRenderer from '../BlockRenderer/BlockRenderer.vue'
import PropsPanel from '../PropsPanel/PropsPanel.vue'
import { supabase } from '@/api/supabase/client'
import { siteGlobalsApi } from '@/api/endpoints/site-globals.api'

const route = useRoute()
const editorStore = useEditorStore()
const isDraggingOver = ref(false)
const siteId = route.params.siteId as string
const pageId = route.params.pageId as string

const handleKeyDown = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
    if (e.shiftKey) editorStore.redo()
    else editorStore.undo()
  }
}

onMounted(async () => {
  window.addEventListener('keydown', handleKeyDown)
  
  const globals = await siteGlobalsApi.getGlobals(siteId)
  if (globals?.i18n_config) {
    editorStore.setEnabledLocales(globals.i18n_config.enabled || ['en'])
    editorStore.setLocale(globals.i18n_config.primary || 'en')
  }

  const { data: pageData } = await supabase.from('pages').select('*').eq('id', pageId).single()
  if (pageData) editorStore.setPage(pageData)
  await editorStore.loadPageData(pageId)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

const onDragOver = (_event: DragEvent) => { isDraggingOver.value = true }
const onDrop = (event: DragEvent) => {
  isDraggingOver.value = false
  const data = event.dataTransfer?.getData('application/json')
  if (data) {
    const template = JSON.parse(data)
    editorStore.addBlock(template)
  }
}
const handleMove = (id: string, direction: 'up' | 'down') => {
  const index = editorStore.blockInstances.findIndex(b => b.id === id)
  if (direction === 'up' && index > 0) editorStore.moveBlock(index, index - 1)
  else if (direction === 'down' && index < editorStore.blockInstances.length - 1) editorStore.moveBlock(index, index + 1)
}
const handleSave = async () => { try { await editorStore.saveChanges() } catch (e) { alert('Failed to save') } }
const openPreview = () => { window.open(`/preview/${siteId}/${pageId}?lang=${editorStore.currentLocale}`, '_blank') }
</script>
