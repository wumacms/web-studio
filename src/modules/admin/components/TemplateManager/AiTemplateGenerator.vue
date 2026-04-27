<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
    <div class="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
      <!-- Header -->
      <div class="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
        <div>
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles class="w-6 h-6 text-primary animate-pulse" />
            AI 区块模板生成器
          </h2>
          <p class="text-xs text-gray-500 mt-1 uppercase tracking-widest font-black">输入 HTML 区块实例，自动生成 Handlebars 模板与 Schema</p>
        </div>
        <button @click="$emit('close')" class="p-2 text-gray-500 hover:text-white transition-colors">
          <X class="w-6 h-6" />
        </button>
      </div>

      <!-- Main Content -->
      <div class="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-px bg-gray-800">
        <!-- Left: Input & Editor -->
        <div class="bg-gray-950 flex flex-col overflow-hidden">
          <div class="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/20">
            <span class="text-[10px] font-black uppercase tracking-widest text-gray-500">原始 HTML 区块实例</span>
            <button 
              @click="generate" 
              :disabled="generating || !rawHtml"
              class="px-4 py-1.5 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2"
            >
              <template v-if="generating">
                <Loader2 class="w-3 h-3 animate-spin" /> 正在生成...
              </template>
              <template v-else>
                <Wand2 class="w-3 h-3" /> 开始生成
              </template>
            </button>
          </div>
          <div class="flex-1 relative">
            <CodeEditor 
              v-model="rawHtml" 
              language="html" 
              class="absolute inset-0"
            />
          </div>
        </div>

        <!-- Right: Result & Preview -->
        <div class="bg-gray-950 flex flex-col overflow-hidden">
          <!-- Tabs -->
          <div class="flex border-b border-gray-800 bg-gray-900/20">
            <button 
              v-for="tab in ['PREVIEW', 'TEMPLATE', 'SCHEMA']" 
              :key="tab"
              @click="activeTab = tab"
              :class="[
                'flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all',
                activeTab === tab ? 'text-primary bg-primary/5 border-b-2 border-primary' : 'text-gray-500 hover:text-gray-300'
              ]"
            >
              {{ tab }}
            </button>
          </div>

          <div class="flex-1 relative overflow-hidden">
            <!-- Preview -->
            <div v-show="activeTab === 'PREVIEW'" class="absolute inset-0 p-6 overflow-auto bg-white/5 bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:20px_20px]">
              <div v-if="generatedData" class="bg-white rounded-xl shadow-2xl overflow-hidden min-h-[200px]">
                <TemplatePreview :html="generatedData.html_code" :props="previewProps" />
              </div>
              <div v-else class="h-full flex flex-col items-center justify-center text-gray-600 space-y-4">
                <div class="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center">
                  <EyeOff class="w-8 h-8 opacity-20" />
                </div>
                <p class="text-xs font-bold uppercase tracking-widest">等待 AI 生成预览</p>
              </div>
            </div>

            <!-- Template Editor -->
            <div v-show="activeTab === 'TEMPLATE'" class="absolute inset-0">
               <CodeEditor 
                v-if="generatedData"
                v-model="generatedData.html_code" 
                language="html" 
                class="absolute inset-0"
              />
            </div>

            <!-- Schema Editor -->
            <div v-show="activeTab === 'SCHEMA'" class="absolute inset-0">
               <CodeEditor 
                v-if="generatedData"
                v-model="generatedSchemaJson" 
                language="json" 
                class="absolute inset-0"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-gray-800 flex items-center justify-between bg-gray-900/50">
        <div class="flex items-center gap-4">
          <div class="flex flex-col">
            <span class="text-[9px] font-black text-gray-500 uppercase tracking-tighter">模板名称</span>
            <input 
              v-model="templateName" 
              placeholder="例如: Hero Section" 
              class="bg-transparent border-b border-gray-800 focus:border-primary text-sm text-white outline-none py-1 transition-all"
            />
          </div>
          <div class="flex flex-col">
            <span class="text-[9px] font-black text-gray-500 uppercase tracking-tighter">分类</span>
            <select v-model="category" class="bg-transparent border-b border-gray-800 focus:border-primary text-sm text-white outline-none py-1 transition-all">
              <option value="Hero">Hero</option>
              <option value="Features">Features</option>
              <option value="Pricing">Pricing</option>
              <option value="General">General</option>
            </select>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button @click="$emit('close')" class="px-6 py-2 text-gray-400 hover:text-white text-xs font-bold transition-all">取消</button>
          <button 
            @click="saveTemplate" 
            :disabled="!generatedData || !templateName || saving"
            class="px-8 py-2 bg-white text-black hover:bg-primary hover:text-white disabled:opacity-20 disabled:grayscale rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            <Loader2 v-if="saving" class="w-3 h-3 animate-spin" />
            {{ saving ? '正在保存...' : '保存为模板' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Sparkles, X, Wand2, Loader2, EyeOff } from 'lucide-vue-next'
import CodeEditor from '@/shared/components/CodeEditor/CodeEditor.vue'
import TemplatePreview from './TemplatePreview.vue'
import { supabase } from '@/api/supabase/client'
import { templateApi } from '@/api/endpoints/template.api'

const emit = defineEmits(['close', 'saved'])

const rawHtml = ref('')
const generating = ref(false)
const saving = ref(false)
const activeTab = ref('PREVIEW')
const templateName = ref('')
const category = ref('General')

const generatedData = ref<{ html_code: string, schema: any } | null>(null)
const generatedSchemaJson = ref('')

// Update internal data when schema JSON editor changes
watch(generatedSchemaJson, (newVal) => {
  try {
    if (generatedData.value) {
      generatedData.value.schema = JSON.parse(newVal)
    }
  } catch (e) {
    // Silent fail for invalid JSON while typing
  }
})

const previewProps = computed(() => {
  if (!generatedData.value?.schema?.properties) return {}
  const props: any = {}
  Object.keys(generatedData.value.schema.properties).forEach(key => {
    if (generatedData.value) {
      props[key] = generatedData.value.schema.properties[key].default
    }
  })
  return props
})

const generate = async () => {
  if (!rawHtml.value) return
  generating.value = true
  
  try {
    const { data, error } = await supabase.functions.invoke('generate-block-template', {
      body: { htmlContent: rawHtml.value }
    })
    
    if (error) throw error
    
    generatedData.value = data
    generatedSchemaJson.value = JSON.stringify(data.schema, null, 2)
    activeTab.value = 'PREVIEW'
    
    // Auto-fill name if empty
    if (!templateName.value) {
      templateName.value = 'AI Generated ' + new Date().toLocaleTimeString()
    }
  } catch (error: any) {
    alert('生成失败: ' + error.message)
  } finally {
    generating.value = false
  }
}

const saveTemplate = async () => {
  if (!generatedData.value || !templateName.value || saving.value) return
  
  saving.value = true
  try {
    await templateApi.createTemplate({
      name: templateName.value,
      category: category.value,
      html_code: generatedData.value.html_code,
      schema: generatedData.value.schema,
      origin: 'AI',
      is_published: true
    })
    
    alert('保存成功！')
    emit('saved')
    emit('close')
  } catch (error: any) {
    alert('保存失败: ' + error.message)
  } finally {
    saving.value = false
  }
}
</script>
