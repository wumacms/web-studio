<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="mb-8">
      <button 
        @click="$router.push('/')"
        class="text-sm font-medium text-gray-500 hover:text-white flex items-center gap-1 mb-4 transition-colors"
      >
        <ChevronLeft class="w-4 h-4" /> Back to Sites
      </button>
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white mb-1">
            {{ siteStore.currentSite?.name || 'Loading...' }}
          </h1>
          <p class="text-xs text-gray-500 font-mono">{{ siteId }}</p>
        </div>
        <div class="flex items-center gap-3">
          <button 
            @click="handleExport"
            :disabled="exporting"
            class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg border border-gray-700 transition-colors flex items-center gap-2"
          >
            <Download v-if="!exporting" class="w-4 h-4" />
            <Loader2 v-else class="w-4 h-4 animate-spin" />
            {{ exporting ? 'Exporting...' : 'Export ZIP' }}
          </button>
          <button 
            @click="handlePublishSiteTemplate"
            :disabled="siteStore.loading"
            class="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
          >
            <Share2 class="w-4 h-4" /> Share as Template
          </button>
          <button 
            @click="showPublishModal = true"

            class="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white text-sm font-bold rounded-lg shadow-lg shadow-primary/20 transition-all hover:scale-105 flex items-center gap-2"
          >
            <Rocket class="w-4 h-4" /> Publish Site
          </button>
          <button 
            @click="$router.push(`/site/${siteId}/settings`)"
            class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg border border-gray-700 transition-colors flex items-center gap-2"
          >
            <Settings class="w-4 h-4" /> Site Settings
          </button>
          <button 
            @click="showTemplateModal = true"
            class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg border border-gray-700 transition-colors"
          >
            Add from Template
          </button>
          <button 
            @click="showCreateModal = true"

            class="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg shadow-lg shadow-primary/20 transition-all"
          >
            Create New Page
          </button>
        </div>
      </div>
    </div>

    <!-- Pages List -->
    <div class="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
      <div v-if="siteStore.pages.length === 0 && !siteStore.loading" class="p-12 text-center text-gray-500">
        No pages created yet. Start by creating a home page.
      </div>
      <div v-else-if="siteStore.loading" class="p-12 text-center">
        <Loader2 class="w-8 h-8 text-primary animate-spin mx-auto" />
      </div>
      <table v-else class="w-full text-left">
        <thead>
          <tr class="border-b border-gray-800 bg-gray-900/50">
            <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Page Name</th>
            <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Path</th>
            <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
          <tr v-for="page in siteStore.pages" :key="page.id" class="hover:bg-gray-800/30 transition-colors group">
            <td class="px-6 py-4">
              <span class="text-white font-medium group-hover:text-primary transition-colors">{{ page.name }}</span>
            </td>
            <td class="px-6 py-4">
              <code class="text-xs bg-gray-950 px-2 py-1 rounded text-primary border border-primary/20 font-mono">{{ page.path }}</code>
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-3">
                <button 
                  @click="openPreview(page.id)"
                  class="p-2 text-gray-500 hover:text-white transition-colors"
                  title="View Preview"
                >
                  <Eye class="w-4 h-4" />
                </button>
                <button 
                  @click="startEditPage(page)"
                  class="p-2 text-gray-500 hover:text-white transition-colors"
                  title="Edit Page Info (SEO & Translations)"
                >
                  <Edit3 class="w-4 h-4" />
                </button>
                <button 
                  @click="handlePublishPageTemplate(page)"
                  class="p-2 text-gray-500 hover:text-purple-400 transition-colors"
                  title="Publish as Template"
                >
                  <Share2 class="w-4 h-4" />
                </button>
                <button 
                  @click="goToEditor(page.id)"

                  class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white text-xs font-bold rounded-lg transition-all"
                >
                  <Rocket class="w-3.5 h-3.5" /> Design
                </button>
                <button class="p-2 text-gray-500 hover:text-red-400 transition-colors">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create Page Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-gray-950/80 backdrop-blur-sm" @click="showCreateModal = false"></div>
      <div class="bg-gray-900 border border-gray-800 w-full max-w-md rounded-3xl p-8 relative shadow-2xl">
        <h2 class="text-2xl font-bold text-white mb-6">Create New Page</h2>
        <div class="space-y-6">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Page Name</label>
            <input v-model="newPageName" placeholder="e.g. Home" class="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Path</label>
            <input v-model="newPagePath" placeholder="e.g. /" class="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none" />
          </div>
        </div>
        <div class="flex gap-4 mt-8">
          <button @click="showCreateModal = false" class="flex-1 py-3 bg-gray-800 text-white rounded-xl font-bold">Cancel</button>
          <button @click="handleCreatePage" :disabled="!newPageName || !newPagePath" class="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 disabled:opacity-50">Create Page</button>
        </div>
      </div>
    </div>

    <!-- Publish Modal -->
    <PublishModal 
      v-if="showPublishModal" 
      :site-id="siteId" 
      :site-name="siteStore.currentSite?.name || 'My Site'" 
      @close="showPublishModal = false" 
    />

    <!-- Edit Page Modal (for Translations) -->
    <div v-if="editingPage" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-gray-950/80 backdrop-blur-sm" @click="editingPage = null"></div>
      <div class="bg-gray-900 border border-gray-800 w-full max-w-md rounded-3xl p-8 relative shadow-2xl">
        <h2 class="text-2xl font-bold text-white mb-2">Edit Page Info</h2>
        <p class="text-gray-500 text-xs mb-6">Localized names for the navigation menu.</p>
        
        <div class="space-y-6">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Primary Name ({{ siteStore.currentGlobals?.i18n_config?.primary || 'en' }})</label>
            <input v-model="editForm.name" class="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none" />
          </div>
          
          <div v-for="lang in otherEnabledLanguages" :key="lang">
            <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Name in {{ lang.toUpperCase() }}</label>
            <input v-model="editForm.translations[lang]" :placeholder="editForm.name" class="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none" />
          </div>
        </div>

        <div class="flex gap-4 mt-8">
          <button @click="editingPage = null" class="flex-1 py-3 bg-gray-800 text-white rounded-xl font-bold">Cancel</button>
          <button @click="handleUpdatePage" :disabled="siteStore.loading" class="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20">
            {{ siteStore.loading ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
    <!-- Template Picker Modal -->
    <div v-if="showTemplateModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-gray-950/80 backdrop-blur-sm" @click="showTemplateModal = false"></div>
      <div class="bg-gray-900 border border-gray-800 w-full max-w-4xl rounded-3xl p-8 relative shadow-2xl max-h-[80vh] flex flex-col">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-bold text-white">Select a Page Template</h2>
          <button @click="showTemplateModal = false" class="text-gray-500 hover:text-white"><X class="w-6 h-6" /></button>
        </div>
        
        <div v-if="loadingTemplates" class="flex-1 flex items-center justify-center">
          <Loader2 class="w-8 h-8 text-primary animate-spin" />
        </div>
        <div v-else class="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-1">
          <div 
            v-for="tpl in marketTemplates" 
            :key="tpl.id"
            class="group bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden hover:border-primary transition-all cursor-pointer"
            @click="handleCreateFromTemplate(tpl)"
          >
            <div class="aspect-video bg-gray-900 relative">
              <img v-if="tpl.preview_image" :src="tpl.preview_image" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-800"><Layout class="w-12 h-12" /></div>
            </div>
            <div class="p-4 flex items-center justify-between">
              <span class="text-sm font-bold text-white">{{ tpl.name }}</span>
              <span class="text-[10px] font-black text-primary uppercase px-2 py-1 bg-primary/10 rounded">Use</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSiteStore } from '../../stores/siteStore'
import { exportService } from '@/shared/services/export.service'
import { ChevronLeft, Edit3, Trash2, Settings, Loader2, Eye, Download, Rocket, Share2, X, Layout } from 'lucide-vue-next'
import PublishModal from '../../../deployment/components/PublishModal.vue'
import { marketApi } from '@/api/endpoints/market.api'
import { pageTemplateApi } from '@/api/endpoints/page-template.api'
import type { Page } from '@/types/models/site'

const route = useRoute()
const router = useRouter()
const siteStore = useSiteStore()
const siteId = computed(() => route.params.siteId as string)

const showCreateModal = ref(false)
const showTemplateModal = ref(false)
const loadingTemplates = ref(false)
const marketTemplates = ref<any[]>([])
const exporting = ref(false)
const showPublishModal = ref(false)
const newPageName = ref('')
const newPagePath = ref('')

const editingPage = ref<Page | null>(null)
const editForm = ref({
  name: '',
  translations: {} as Record<string, string>
})

const otherEnabledLanguages = computed(() => {
  const enabled = siteStore.currentGlobals?.i18n_config?.enabled || ['en']
  const primary = siteStore.currentGlobals?.i18n_config?.primary || 'en'
  return enabled.filter(l => l !== primary)
})

watch(() => siteId.value, async (newId: string) => {
  if (newId) {
    await siteStore.fetchSiteDetails(newId)
    fetchMarketTemplates()
  }
}, { immediate: true })

const fetchMarketTemplates = async () => {
  loadingTemplates.value = true
  try {
    marketTemplates.value = await marketApi.getMarketItems('PAGE')
  } catch (error) {
    console.error('Failed to fetch page templates:', error)
  } finally {
    loadingTemplates.value = false
  }
}

const handleCreateFromTemplate = async (template: any) => {
  const name = prompt('Enter page name:', template.name)
  if (!name) return
  const path = prompt('Enter page path:', `/${name.toLowerCase().replace(/\s+/g, '-')}`)
  if (!path) return

  try {
    siteStore.loading = true
    await pageTemplateApi.addPageToSite(template.id, siteId.value, name, path)
    await siteStore.fetchPages(siteId.value)
    showTemplateModal.value = false
    alert(`Page "${name}" created from template!`)
  } catch (error) {
    alert('Failed to create page from template.')
  } finally {
    siteStore.loading = false
  }
}


const startEditPage = (page: Page) => {
  editingPage.value = page
  editForm.value = {
    name: page.name,
    translations: { ...(page.translations || {}) }
  }
}

const handleUpdatePage = async () => {
  if (!editingPage.value) return
  try {
    await siteStore.updatePage(editingPage.value.id, {
      name: editForm.value.name,
      translations: editForm.value.translations
    })
    editingPage.value = null
  } catch (error) {
    alert('Update failed.')
  }
}

const handlePublishPageTemplate = async (page: Page) => {
  const category = prompt('Enter category for this page template:', 'Landing')
  if (!category) return
  try {
    await siteStore.publishPageAsTemplate(page.id, page.name, category)
    alert(`Page "${page.name}" published to market!`)
  } catch (error) {
    alert('Failed to publish page template.')
  }
}

const handlePublishSiteTemplate = async () => {
  if (!siteStore.currentSite) return
  const category = prompt('Enter category for this site template:', 'Business')
  if (!category) return
  try {
    await siteStore.publishSiteAsTemplate(siteId.value, siteStore.currentSite.name, category)
    alert(`Site "${siteStore.currentSite.name}" published to market!`)
  } catch (error) {
    alert('Failed to publish site template.')
  }
}


const handleExport = async () => {
  exporting.value = true
  try {
    const blob = await exportService.exportToZip(siteId.value)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${siteStore.currentSite?.name || 'site'}.zip`
    a.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    alert('Export failed. Check console for details.')
    console.error(error)
  } finally {
    exporting.value = false
  }
}

const handleCreatePage = async () => {
  if (!newPageName.value || !newPagePath.value) return
  try {
    await siteStore.createPage(siteId.value, newPageName.value, newPagePath.value)
    showCreateModal.value = false
    newPageName.value = ''
    newPagePath.value = ''
  } catch (error) {
    alert('Failed to create page.')
  }
}

const goToEditor = (pageId: string) => {
  router.push(`/site/${siteId.value}/editor/${pageId}`)
}

const openPreview = (pageId: string) => {
  window.open(`${import.meta.env.BASE_URL}preview/${siteId}/${pageId}`, '_blank')
}
</script>
