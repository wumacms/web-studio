import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { BlockInstance, BlockTemplate } from '@/types/models/block'
import type { Page } from '@/types/models/site'
import { blockApi } from '@/api/endpoints/block.api'
import { templateApi } from '@/api/endpoints/template.api'

export const useEditorStore = defineStore('page-editor', () => {
  const currentPage = ref<Page | null>(null)
  const blockInstances = ref<BlockInstance[]>([])
  const selectedBlockId = ref<string | null>(null)
  const isDirty = ref(false)
  const loading = ref(false)
  
  // i18n State
  const currentLocale = ref('en')
  const availableLocales = ref(['en'])

  // History State
  const history = ref<string[]>([])
  const historyIndex = ref(-1)
  let isInternalChange = false

  const sortedBlocks = computed(() => 
    [...blockInstances.value].sort((a, b) => a.sort_order - b.sort_order)
  )

  const selectedBlock = computed(() => 
    blockInstances.value.find(b => b.id === selectedBlockId.value) ?? null
  )

  const canUndo = computed(() => historyIndex.value > 0)
  const canRedo = computed(() => historyIndex.value < history.value.length - 1)

  watch(blockInstances, (newVal) => {
    if (isInternalChange) return
    recordHistory(newVal)
  }, { deep: true })

  function recordHistory(blocks: BlockInstance[]) {
    const snapshot = JSON.stringify(blocks)
    if (snapshot === history.value[historyIndex.value]) return
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1)
    }
    history.value.push(snapshot)
    if (history.value.length > 50) history.value.shift()
    historyIndex.value = history.value.length - 1
  }

  function undo() {
    if (!canUndo.value) return
    historyIndex.value--
    applyHistorySnapshot()
  }

  function redo() {
    if (!canRedo.value) return
    historyIndex.value++
    applyHistorySnapshot()
  }

  function applyHistorySnapshot() {
    isInternalChange = true
    blockInstances.value = JSON.parse(history.value[historyIndex.value])
    isDirty.value = true
    setTimeout(() => { isInternalChange = false }, 0)
  }

  async function loadPageData(pageId: string) {
    loading.value = true
    try {
      const blocks = await blockApi.getPageBlocks(pageId)
      blockInstances.value = blocks
      history.value = [JSON.stringify(blocks)]
      historyIndex.value = 0
      isDirty.value = false
    } catch (error) {
      console.error('Failed to load blocks:', error)
    } finally {
      loading.value = false
    }
  }

  async function saveChanges() {
    if (!currentPage.value) {
      console.warn('Cannot save: No current page selected')
      return
    }
    
    loading.value = true
    try {
      console.log('Saving blocks for page:', currentPage.value.id)
      await blockApi.upsertBlocks(currentPage.value.id, blockInstances.value)
      isDirty.value = false
      console.log('Save successful')
    } catch (error) {
      console.error('Failed to save changes:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  function setPage(page: Page) {
    currentPage.value = page
  }

  function addBlock(template: BlockTemplate, atIndex?: number) {
    const newInstance: BlockInstance = {
      id: crypto.randomUUID(),
      page_id: currentPage.value?.id || '',
      source_template_id: template.id,
      copied_html_code: template.html_code,
      copied_schema: template.schema,
      props_data: extractDefaults(template.schema),
      translations: {},
      sort_order: blockInstances.value.length,
      created_at: new Date().toISOString()
    }

    if (typeof atIndex === 'number') {
      blockInstances.value.splice(atIndex, 0, newInstance)
      blockInstances.value.forEach((b, i) => b.sort_order = i)
    } else {
      blockInstances.value.push(newInstance)
    }
    
    selectedBlockId.value = newInstance.id
    isDirty.value = true
  }

  function removeBlock(id: string) {
    blockInstances.value = blockInstances.value.filter(b => b.id !== id)
    if (selectedBlockId.value === id) selectedBlockId.value = null
    isDirty.value = true
  }

  function moveBlock(fromIndex: number, toIndex: number) {
    const element = blockInstances.value.splice(fromIndex, 1)[0]
    blockInstances.value.splice(toIndex, 0, element)
    blockInstances.value.forEach((block, index) => { block.sort_order = index })
    isDirty.value = true
  }

  function updateBlockProps(id: string, props: Record<string, any>) {
    const block = blockInstances.value.find(b => b.id === id)
    if (!block) return

    if (currentLocale.value === 'en') {
      block.props_data = { ...block.props_data, ...props }
    } else {
      if (!block.translations) block.translations = {}
      if (!block.translations[currentLocale.value]) {
        // Initialize translation with current props data
        block.translations[currentLocale.value] = { ...block.props_data }
      }
      block.translations[currentLocale.value] = { 
        ...block.translations[currentLocale.value], 
        ...props 
      }
    }
    isDirty.value = true
  }

  function selectBlock(id: string | null) {
    selectedBlockId.value = id
  }

  async function saveInstanceAsTemplate(blockId: string, name: string) {
    const block = blockInstances.value.find(b => b.id === blockId)
    if (!block) throw new Error('Block not found')

    await templateApi.createTemplate({
      name,
      html_code: block.copied_html_code,
      schema: block.copied_schema,
      category: 'General',
      origin: 'USER',
      is_published: true
    })
  }

  function setLocale(locale: string) {
    currentLocale.value = locale
  }

  function setEnabledLocales(locales: string[]) {
    availableLocales.value = locales
  }

  function extractDefaults(schema: any): Record<string, any> {
    const defaults: Record<string, any> = {}
    if (schema?.properties) {
      Object.entries(schema.properties).forEach(([key, value]: [string, any]) => {
        if (value.default !== undefined) {
          defaults[key] = value.default
        }
      })
    }
    return defaults
  }

  return {
    currentPage,
    blockInstances,
    selectedBlockId,
    isDirty,
    loading,
    currentLocale,
    availableLocales,
    canUndo,
    canRedo,
    sortedBlocks,
    selectedBlock,
    undo,
    redo,
    loadPageData,
    saveChanges,
    setPage,
    addBlock,
    removeBlock,
    moveBlock,
    updateBlockProps,
    selectBlock,
    saveInstanceAsTemplate,
    setLocale,
    setEnabledLocales
  }
})
