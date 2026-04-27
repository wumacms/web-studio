<template>
  <div 
    class="relative group/block transition-all duration-300"
    :class="[
      isSelected ? 'ring-4 ring-primary ring-inset z-20 shadow-2xl' : 'hover:ring-2 hover:ring-primary/30'
    ]"
    @click.stop="$emit('select', block.id)"
  >
    <!-- Content Render -->
    <div v-html="renderedHtml" class="pointer-events-none"></div>

    <!-- Block Controls Overlay -->
    <div 
      v-if="isSelected"
      class="absolute -top-12 right-0 flex items-center gap-1 bg-primary text-white p-1 rounded-t-lg shadow-lg z-30"
    >
      <div class="px-3 py-1 text-[10px] font-black uppercase tracking-widest border-r border-white/20">
        {{ blockName }}
      </div>
      <button @click.stop="$emit('move', 'up')" class="p-1.5 hover:bg-white/20 rounded transition-colors">
        <ChevronUp class="w-4 h-4" />
      </button>
      <button @click.stop="$emit('move', 'down')" class="p-1.5 hover:bg-white/20 rounded transition-colors">
        <ChevronDown class="w-4 h-4" />
      </button>
      <div class="w-px h-4 bg-white/20 mx-1"></div>
      <button v-if="authStore.isAdmin" @click.stop="handleSaveAsTemplate" class="p-1.5 hover:bg-white/20 rounded transition-colors" title="Save as Template">
        <CopyPlus class="w-4 h-4" />
      </button>
      <div class="w-px h-4 bg-white/20 mx-1"></div>
      <button @click.stop="$emit('delete', block.id)" class="p-1.5 hover:bg-red-500 rounded transition-colors">
        <Trash2 class="w-4 h-4" />
      </button>
    </div>

    <!-- Selection indicator for non-selected hovered block -->
    <div v-if="!isSelected" class="absolute inset-0 bg-primary/5 opacity-0 group-hover/block:opacity-100 pointer-events-none transition-opacity"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Handlebars from 'handlebars'
import { Trash2, ChevronUp, ChevronDown, CopyPlus } from 'lucide-vue-next'
import type { BlockInstance } from '@/types/models/block'
import { useEditorStore } from '../../stores/editorStore'
import { useAuthStore } from '@/modules/auth/stores/authStore'

const props = defineProps<{
  block: BlockInstance
  isSelected: boolean
}>()

const emit = defineEmits(['select', 'delete', 'move'])
const editorStore = useEditorStore()
const authStore = useAuthStore()

const handleSaveAsTemplate = async () => {
  const name = prompt('Enter a name for this new template:', 'New Block Template')
  if (!name) return
  
  try {
    await editorStore.saveInstanceAsTemplate(props.block.id, name)
    alert('Block saved as template successfully!')
  } catch (error) {
    alert('Failed to save block as template.')
  }
}

const blockName = computed(() => props.block.source_template_id.split('-')[0])

const renderedHtml = computed(() => {
  try {
    const template = Handlebars.compile(props.block.copied_html_code)
    
    // Select the correct props data based on locale
    const locale = editorStore.currentLocale
    const displayProps = (locale !== 'en' && props.block.translations?.[locale]) 
      ? props.block.translations[locale] 
      : props.block.props_data
    
    return template(displayProps)
  } catch (error) {
    console.error('Render error:', error)
    return `<div class="p-4 bg-red-100 text-red-500 text-xs">Render Error: \${(error as Error).message}</div>`
  }
})
</script>
