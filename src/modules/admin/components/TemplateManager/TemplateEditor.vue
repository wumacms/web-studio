<template>
  <div class="h-screen flex flex-col bg-gray-950 overflow-hidden">
    <!-- Editor Header -->
    <header class="flex-none h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 z-30">
      <div class="flex items-center gap-4">
        <button @click="$router.push('/admin/templates')" class="p-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div>
          <input 
            v-model="templateData.name"
            class="bg-transparent text-lg font-bold text-white border-none focus:outline-none placeholder:text-gray-700 w-64"
            placeholder="Template Name..."
          />
        </div>
      </div>

      <div class="flex items-center gap-3">
        <select v-model="templateData.category" class="bg-gray-800 text-xs text-gray-300 border-none rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary">
          <option value="Hero">Hero</option>
          <option value="Features">Features</option>
          <option value="CTA">CTA</option>
          <option value="Pricing">Pricing</option>
          <option value="Footer">Footer</option>
          <option value="General">General</option>
        </select>
        
        <div class="h-4 w-px bg-gray-800 mx-2"></div>
        
        <button 
          @click="saveTemplate"
          :disabled="saving"
          class="inline-flex items-center gap-2 px-5 py-2 bg-primary text-white text-sm font-bold rounded-lg shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          <Save v-if="!saving" class="w-4 h-4" />
          <Loader2 v-else class="w-4 h-4 animate-spin" />
          {{ isNew ? 'Create' : 'Save' }}
        </button>
      </div>
    </header>

    <!-- Main Workspace -->
    <main class="flex-1 flex overflow-hidden">
      <!-- Left Panel: Editors -->
      <div class="w-1/2 flex flex-col border-r border-gray-800 bg-gray-900">
        <div class="flex-none flex bg-gray-950 px-4">
          <button 
            v-for="tab in ['HTML', 'Schema']" 
            :key="tab"
            @click="activeTab = tab"
            class="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative"
            :class="activeTab === tab ? 'text-primary' : 'text-gray-500 hover:text-gray-300'"
          >
            {{ tab }}
            <div v-if="activeTab === tab" class="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full"></div>
          </button>
        </div>

        <div class="flex-1 p-6 overflow-hidden">
          <CodeEditor 
            v-if="activeTab === 'HTML'"
            v-model="templateData.html_code"
            language="html"
            class="h-full"
          />
          <CodeEditor 
            v-else
            v-model="schemaJson"
            language="json"
            class="h-full"
          />
        </div>
      </div>

      <!-- Right Panel: Preview & Props -->
      <div class="w-1/2 flex flex-col bg-gray-950">
        <!-- Preview Section -->
        <div class="flex-1 p-8 overflow-y-auto custom-scrollbar border-b border-gray-800 flex flex-col">
          <div class="flex items-center justify-between mb-4 flex-none">
            <span class="text-[10px] font-black uppercase tracking-widest text-gray-500">Live Preview</span>
            <div class="flex items-center gap-2">
              <button class="p-1.5 text-gray-600 hover:text-white transition-colors"><Monitor class="w-4 h-4" /></button>
              <button class="p-1.5 text-gray-600 hover:text-white transition-colors"><Smartphone class="w-4 h-4" /></button>
            </div>
          </div>
          
          <div class="flex-1 bg-white rounded-2xl shadow-2xl overflow-hidden min-h-[400px]">
             <TemplatePreview 
               :html="templateData.html_code" 
               :props="previewProps"
             />
          </div>
        </div>

        <!-- Dynamic Form Section -->
        <div class="h-1/3 bg-gray-900 p-8 overflow-y-auto custom-scrollbar">
           <div class="flex items-center justify-between mb-6">
            <span class="text-[10px] font-black uppercase tracking-widest text-gray-500">Test Properties</span>
            <button @click="resetProps" class="text-[10px] text-primary font-bold hover:underline">Reset Defaults</button>
          </div>
          
          <JsonSchemaForm 
            v-model="previewProps"
            :schema="parsedSchema"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Save, Loader2, Monitor, Smartphone } from 'lucide-vue-next'
import { templateApi } from '@/api/endpoints/template.api'
import type { BlockTemplate } from '@/types/models/block'

import CodeEditor from '@/shared/components/CodeEditor/CodeEditor.vue'
import JsonSchemaForm from '@/shared/components/JsonSchemaForm/JsonSchemaForm.vue'
import TemplatePreview from './TemplatePreview.vue'

const route = useRoute()
const router = useRouter()

const isNew = computed(() => route.params.id === 'new')
const activeTab = ref('HTML')
const saving = ref(false)

const templateData = ref<Partial<BlockTemplate>>({
  name: '',
  category: 'General',
  html_code: '<section class="py-20 px-4 bg-gray-50">\n  <div class="max-w-4xl mx-auto text-center">\n    <h2 class="text-4xl font-bold mb-4">{{{ title }}}</h2>\n    <p class="text-xl text-gray-600 mb-8">{{ subtitle }}</p>\n    <button class="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold">{{ buttonText }}</button>\n  </div>\n</section>',
  schema: {
    type: 'object',
    properties: {
      title: { type: 'string', title: 'Title', default: 'Create Something Amazing' },
      subtitle: { type: 'string', title: 'Subtitle', default: 'Build faster with reusable blocks and real-time editing.' },
      buttonText: { type: 'string', title: 'Button Text', default: 'Get Started' }
    },
    required: ['title']
  },
  is_published: true
})

// Initialize previewProps with current defaults
const getDefaultsFromSchema = (schema: any) => {
  const defaults: any = {}
  if (schema?.properties) {
    Object.keys(schema.properties).forEach(key => {
      defaults[key] = schema.properties[key].default
    })
  }
  return defaults
}

const schemaJson = ref(JSON.stringify(templateData.value.schema, null, 2))
const previewProps = ref<Record<string, any>>(getDefaultsFromSchema(templateData.value.schema))

const parsedSchema = computed(() => {
  try {
    return JSON.parse(schemaJson.value)
  } catch {
    return templateData.value.schema
  }
})

// Sync schema JSON with data
watch(schemaJson, (newVal) => {
  try {
    templateData.value.schema = JSON.parse(newVal)
  } catch (e) {
    // Ignore invalid JSON during typing
  }
})

// Update preview props when schema changes
watch(parsedSchema, (newSchema, oldSchema) => {
  if (!newSchema) return
  
  const defaults: any = { ...previewProps.value }
  const newProps = newSchema.properties || {}
  const oldProps = (oldSchema as any)?.properties || {}

  Object.keys(newProps).forEach(key => {
    // If it's a brand new key, or the default value has changed in the schema, 
    // and the current value is either missing or matches the OLD default, update it.
    const newDefault = newProps[key].default
    const oldDefault = oldProps[key]?.default

    if (previewProps.value[key] === undefined || (newDefault !== oldDefault && previewProps.value[key] === oldDefault)) {
      defaults[key] = newDefault
    }
  })
  
  // Remove keys that are no longer in the schema
  Object.keys(defaults).forEach(key => {
    if (!newProps[key]) delete defaults[key]
  })

  previewProps.value = defaults
}, { immediate: true, deep: true })

const resetProps = () => {
  const defaults: any = {}
  if (parsedSchema.value.properties) {
    Object.keys(parsedSchema.value.properties).forEach(key => {
      defaults[key] = parsedSchema.value.properties[key].default
    })
  }
  previewProps.value = defaults
}

const saveTemplate = async () => {
  if (!templateData.value.name) return alert('Please enter a name')
  
  try {
    saving.value = true
    if (isNew.value) {
      await templateApi.createTemplate(templateData.value)
    } else {
      await templateApi.updateTemplate(route.params.id as string, templateData.value)
    }
    router.push('/admin/templates')
  } catch (error) {
    alert('Failed to save template.')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (!isNew.value) {
    try {
      const data = await templateApi.getTemplateById(route.params.id as string)
      templateData.value = data
      // Clear preview props first to avoid merging with initial hardcoded defaults
      previewProps.value = {} 
      schemaJson.value = JSON.stringify(data.schema, null, 2)
      // The watcher will now see undefined for all keys and pick up the correct defaults
    } catch (error) {
      alert('Template not found')
      router.push('/admin/templates')
    }
  } else {
    resetProps()
  }
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #1f2937;
  border-radius: 10px;
}
</style>
