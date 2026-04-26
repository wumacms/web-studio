import { defineStore } from 'pinia'
import { ref } from 'vue'
import { templateApi } from '@/api/endpoints/template.api'
import { marketApi } from '@/api/endpoints/market.api'
import type { BlockTemplate } from '@/types/models/block'

export const useTemplateStore = defineStore('templates', () => {
  const availableTemplates = ref<BlockTemplate[]>([])
  const loading = ref(false)

  async function loadEditorTemplates() {
    loading.value = true
    try {
      // Load both system/public templates and my own templates
      const [publicTpls, myTpls] = await Promise.all([
        marketApi.getMarketItems('BLOCK'),
        templateApi.getMyTemplates()
      ])
      
      // Merge and remove duplicates (by ID)
      const all = [...myTpls, ...publicTpls]
      availableTemplates.value = all.filter((tpl, index, self) => 
        index === self.findIndex((t) => t.id === tpl.id)
      )
    } catch (error) {
      console.error('Failed to load editor templates:', error)
    } finally {
      loading.value = false
    }
  }

  async function saveAsTemplate(name: string, html: string, schema: any, category: string, publish = false) {
    try {
      const newTpl = await templateApi.createTemplate({
        name,
        html_code: html,
        schema,
        category,
        origin: 'USER',
        is_published: publish
      })
      availableTemplates.value.unshift(newTpl)
      return newTpl
    } catch (error) {
      console.error('Failed to save as template:', error)
      throw error
    }
  }

  return {
    availableTemplates,
    loading,
    loadEditorTemplates,
    saveAsTemplate
  }
})

