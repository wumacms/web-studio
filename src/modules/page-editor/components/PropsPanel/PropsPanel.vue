<template>
  <div class="h-full flex flex-col">
    <div v-if="!selectedBlock" class="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500">
      <div class="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-4"><MousePointer2 class="w-6 h-6" /></div>
      <p class="text-sm italic">Select a block on the canvas to edit its properties</p>
    </div>

    <div v-else class="flex-1 flex flex-col min-h-0">
      <!-- Tab Headers -->
      <div class="flex border-b border-gray-800 bg-gray-900/50">
        <button @click="activeTab = 'props'" :class="['flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors', activeTab === 'props' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-gray-500 hover:text-white']">Props</button>
        <button @click="activeTab = 'actions'" :class="['flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors', activeTab === 'actions' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-gray-500 hover:text-white']">Actions</button>
      </div>

      <!-- Properties Tab -->
      <div v-if="activeTab === 'props'" class="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        <!-- Locale Indicator -->
        <div v-if="editorStore.currentLocale !== 'en'" class="bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-center gap-2 mb-4">
          <Languages class="w-4 h-4 text-primary" />
          <span class="text-[10px] font-bold text-primary uppercase">Editing {{ editorStore.currentLocale }} Translation</span>
        </div>

        <!-- AI Assistant Integration -->
        <AIAssistant :context="JSON.stringify(displayProps)" @apply="handleAIApply" />

        <div v-for="key in propertyKeys" :key="key" class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="block text-xs font-semibold text-gray-400 uppercase tracking-tight">{{ properties[key].title || key }}</label>
            <Sparkles v-if="properties[key].type === 'string'" class="w-3 h-3 text-primary/50 cursor-help" />
          </div>
          
          <!-- Image Picker Field -->
          <div v-if="isImageField(key, properties[key])" class="space-y-3">
            <div class="aspect-video bg-gray-950 rounded-lg overflow-hidden border border-gray-800 relative group/img">
              <img v-if="displayProps[key]" :src="displayProps[key]" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-700"><ImageIcon class="w-8 h-8" /></div>
              <div class="absolute inset-0 bg-gray-950/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button @click="openImagePicker(key)" class="p-2 bg-primary text-white rounded-lg shadow-lg"><Search class="w-4 h-4" /></button>
                <button v-if="displayProps[key]" @click="updateProp(key, '')" class="p-2 bg-red-500 text-white rounded-lg shadow-lg"><Trash2 class="w-4 h-4" /></button>
              </div>
            </div>
            <input type="text" :value="displayProps[key]" @input="updateProp(key, ($event.target as HTMLInputElement).value)" placeholder="Image URL..." class="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-[10px] text-gray-500 focus:outline-none font-mono" />
          </div>

          <!-- Standard String Input -->
          <input v-else-if="properties[key].type === 'string' && !properties[key].enum && properties[key].format !== 'color'" type="text" :value="displayProps[key]" @input="updateProp(key, ($event.target as HTMLInputElement).value)" @focus="lastFocusedKey = key" class="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" />

          <!-- Textarea -->
          <textarea v-else-if="properties[key].type === 'string' && properties[key].format === 'textarea'" :value="displayProps[key]" @input="updateProp(key, ($event.target as HTMLTextAreaElement).value)" @focus="lastFocusedKey = key" rows="4" class="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"></textarea>

          <!-- Color Picker -->
          <div v-else-if="properties[key].format === 'color'" class="flex items-center gap-3">
            <input type="color" :value="displayProps[key]" @input="updateProp(key, ($event.target as HTMLInputElement).value)" class="w-8 h-8 bg-transparent border-0 p-0 cursor-pointer" />
            <input type="text" :value="displayProps[key]" @input="updateProp(key, ($event.target as HTMLInputElement).value)" class="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary transition-colors font-mono" />
          </div>

          <!-- Select -->
          <select v-else-if="properties[key].enum" :value="displayProps[key]" @change="updateProp(key, ($event.target as HTMLSelectElement).value)" class="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"><option v-for="opt in (properties[key].enum as string[])" :key="opt" :value="opt">{{ opt }}</option></select>

          <!-- Boolean -->
          <div v-else-if="properties[key].type === 'boolean'" class="flex items-center gap-2">
            <input type="checkbox" :checked="displayProps[key]" @change="updateProp(key, ($event.target as HTMLInputElement).checked)" class="w-4 h-4 rounded border-gray-800 bg-gray-950 text-primary" />
            <span class="text-xs text-gray-400">Enable feature</span>
          </div>

          <!-- Array / List Editor -->
          <div v-else-if="properties[key].type === 'array'" class="space-y-4 pt-2">
            <div v-for="(item, index) in (displayProps[key] as any[])" :key="index" class="bg-gray-950/50 border border-gray-800 rounded-xl p-4 relative group/item">
              <button @click="removeItem(key, index)" class="absolute top-2 right-2 p-1 text-gray-600 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity">
                <Trash2 class="w-3 h-3" />
              </button>
              
              <!-- If array of objects (e.g. features, links) -->
              <div v-if="properties[key].items?.type === 'object'" class="space-y-4">
                <div v-for="subKey in Object.keys(properties[key].items.properties)" :key="subKey" class="space-y-1">
                  <label class="block text-[10px] font-bold text-gray-500 uppercase">{{ subKey }}</label>
                  <input 
                    type="text" 
                    :value="item[subKey]" 
                    @input="updateArrayItem(key, index, subKey, ($event.target as HTMLInputElement).value)"
                    class="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              
              <!-- If array of strings -->
              <div v-else>
                <input 
                  type="text" 
                  :value="item" 
                  @input="updateArrayItem(key, index, null, ($event.target as HTMLInputElement).value)"
                  class="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            
            <button 
              @click="addItem(key)" 
              class="w-full py-2 border border-dashed border-gray-700 rounded-xl text-[10px] font-bold text-gray-500 uppercase hover:text-white hover:border-gray-500 transition-colors"
            >
              + Add Item
            </button>
          </div>
        </div>
      </div>

      <!-- Actions Tab -->
      <div v-else class="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        <section>
          <h4 class="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Save as Template</h4>
          <div class="space-y-4">
            <input v-model="templateName" placeholder="Template Name" class="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-primary focus:outline-none" />
            
            <div class="flex items-center gap-2 px-1">
              <input type="checkbox" v-model="shouldPublish" id="publish-toggle" class="w-4 h-4 rounded border-gray-800 bg-gray-950 text-primary" />
              <label for="publish-toggle" class="text-[10px] font-bold text-gray-400 uppercase cursor-pointer">Publish to Market</label>
            </div>

            <button @click="handleSaveAsTemplate" :disabled="!templateName || savingTemplate" class="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold uppercase rounded-xl transition-all border border-gray-700 flex items-center justify-center gap-2">
              <Save v-if="!savingTemplate" class="w-4 h-4" />
              <Loader2 v-else class="w-4 h-4 animate-spin" />
              {{ shouldPublish ? 'Publish to Market' : 'Save to Library' }}
            </button>
          </div>
        </section>

        <section class="pt-8 border-t border-gray-800">
          <h4 class="text-xs font-black text-red-500 uppercase tracking-widest mb-4">Danger Zone</h4>
          <button @click="editorStore.removeBlock(selectedBlock!.id)" class="w-full py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-xs font-bold uppercase rounded-xl transition-all border border-red-500/20">Delete Block</button>
        </section>
      </div>
    </div>

    <!-- Modals -->
    <ImagePicker v-if="showImagePicker" @close="showImagePicker = false" @select="handleImageSelect" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useEditorStore } from '../../stores/editorStore'
import { useTemplateStore } from '../../stores/templateStore'
import { MousePointer2, Save, Loader2, Sparkles, Image as ImageIcon, Search, Trash2, Languages } from 'lucide-vue-next'
import AIAssistant from '@/shared/components/AI/AIAssistant.vue'
import ImagePicker from '@/shared/components/ui/ImagePicker.vue'

const editorStore = useEditorStore()
const templateStore = useTemplateStore()
const selectedBlock = computed(() => editorStore.selectedBlock)

const activeTab = ref<'props' | 'actions'>('props')
const templateName = ref('')
const shouldPublish = ref(false)
const savingTemplate = ref(false)
const lastFocusedKey = ref<string | null>(null)
const showImagePicker = ref(false)
const currentImageKey = ref<string | null>(null)

const properties = computed(() => (selectedBlock.value?.copied_schema?.properties || {}) as Record<string, any>)
const propertyKeys = computed(() => Object.keys(properties.value))

const displayProps = computed(() => {
  if (!selectedBlock.value) return {}
  const locale = editorStore.currentLocale
  if (locale === 'en') return selectedBlock.value.props_data
  return selectedBlock.value.translations?.[locale] || selectedBlock.value.props_data
})

watch(selectedBlock, (newVal) => {
  if (newVal) {
    templateName.value = newVal.source_template_id ? `Copy of ${newVal.source_template_id}` : 'My New Block'
    shouldPublish.value = false
  }
})

const isImageField = (key: string, field: any) => field.format === 'image' || key.toLowerCase().includes('image') || key.toLowerCase().includes('url') && (key.toLowerCase().includes('img') || key.toLowerCase().includes('pic'))
const updateProp = (key: string, value: any) => { if (selectedBlock.value) editorStore.updateBlockProps(selectedBlock.value.id, { [key]: value }) }

const updateArrayItem = (key: string, index: number, subKey: string | null, value: any) => {
  if (!selectedBlock.value) return
  const currentArray = [...(displayProps.value[key] || [])]
  if (subKey) {
    currentArray[index] = { ...currentArray[index], [subKey]: value }
  } else {
    currentArray[index] = value
  }
  updateProp(key, currentArray)
}

const addItem = (key: string) => {
  if (!selectedBlock.value) return
  const currentArray = [...(displayProps.value[key] || [])]
  const schema = properties.value[key]
  
  let newItem: any = ""
  if (schema.items?.type === 'object') {
    newItem = {}
    Object.keys(schema.items.properties).forEach(k => {
      newItem[k] = schema.items.properties[k].default || ""
    })
  }
  
  currentArray.push(newItem)
  updateProp(key, currentArray)
}

const removeItem = (key: string, index: number) => {
  if (!selectedBlock.value) return
  const currentArray = [...(displayProps.value[key] || [])]
  currentArray.splice(index, 1)
  updateProp(key, currentArray)
}

const handleAIApply = (text: string) => {
  console.log('handleAIApply received:', text)
  try {
    const parsed = JSON.parse(text)
    if (typeof parsed === 'object' && parsed !== null) {
      // 1. If it's an array, look for an array property
      if (Array.isArray(parsed)) {
        const targetKey = lastFocusedKey.value || propertyKeys.value.find(k => properties.value[k].type === 'array')
        if (targetKey) {
          updateProp(targetKey, parsed)
          alert(`Applied array data to: ${targetKey}`)
          return
        }
      } else {
        // 2. If it's an object, try to map keys
        let updatedKeys: string[] = []
        Object.keys(parsed).forEach(k => {
          if (propertyKeys.value.includes(k)) {
            updateProp(k, parsed[k])
            updatedKeys.push(k)
          }
        })
        if (updatedKeys.length > 0) {
          alert(`Updated multiple fields: ${updatedKeys.join(', ')}`)
          return
        }
      }
      
      // 3. Fallback: Set whole object to focused key
      if (lastFocusedKey.value) {
        updateProp(lastFocusedKey.value, parsed)
        alert(`Applied object to: ${lastFocusedKey.value}`)
        return
      }
    }
  } catch (e) {
    // Not JSON, continue to text application
  }

  // 4. Text application
  const targetKey = lastFocusedKey.value || propertyKeys.value.find(k => properties.value[k].type === 'string')
  if (targetKey) {
    updateProp(targetKey, text)
    alert(`Applied text to: ${targetKey}`)
  } else {
    alert('No suitable property found to apply this content.')
  }
}
const openImagePicker = (key: string) => { currentImageKey.value = key; showImagePicker.value = true }
const handleImageSelect = (url: string) => { if (currentImageKey.value) updateProp(currentImageKey.value, url); showImagePicker.value = false }
const handleSaveAsTemplate = async () => { 
  if (!selectedBlock.value || !templateName.value) return; 
  savingTemplate.value = true; 
  try { 
    await templateStore.saveAsTemplate(
      templateName.value, 
      selectedBlock.value.copied_html_code, 
      selectedBlock.value.copied_schema, 
      'Custom',
      shouldPublish.value
    ); 
    activeTab.value = 'props';
    alert(shouldPublish.value ? 'Published to market!' : 'Saved to library!');
  } finally { 
    savingTemplate.value = false 
  } 
}
</script>

