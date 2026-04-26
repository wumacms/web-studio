<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
      <div>
        <h1 class="text-4xl font-extrabold tracking-tight text-white mb-2">
          My Websites
        </h1>
        <p class="text-gray-400 text-lg">
          Manage and build your stunning web projects.
        </p>
      </div>
      <div class="flex items-center gap-4">
        <button 
          @click="showMagicBuilder = true"
          class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-xl shadow-primary/20 transition-all hover:scale-105"
        >
          <Wand2 class="w-5 h-5" />
          Magic Create (AI)
        </button>
        <button 
          @click="showTemplateModal = true"
          class="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl border border-gray-700 transition-all"
        >
          <LayoutTemplate class="w-5 h-5" />
          Use Template
        </button>
        <button 
          @click="showCreateModal = true"
          class="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl border border-gray-800 transition-all"
        >
          <Plus class="w-5 h-5" />
          Blank Site
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!siteStore.loading && siteStore.sites.length === 0" 
      class="bg-gray-900/50 border-2 border-dashed border-gray-800 rounded-3xl py-20 px-4 text-center"
    >
      <div class="w-20 h-20 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Layout class="w-10 h-10 text-gray-500" />
      </div>
      <h3 class="text-xl font-bold text-white mb-2">Build your first site</h3>
      <p class="text-gray-400 mb-8 max-w-md mx-auto">
        Start with AI magic, a template, or from scratch.
      </p>
      <div class="flex items-center justify-center gap-6">
        <button @click="showMagicBuilder = true" class="text-primary font-bold hover:underline flex items-center gap-2">
          <Wand2 class="w-4 h-4" /> Magic AI
        </button>
        <button @click="showTemplateModal = true" class="text-white font-semibold hover:underline">Templates</button>
      </div>
    </div>

    <!-- Sites Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      <div v-for="site in siteStore.sites" :key="site.id" 
        class="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-primary/5 duration-300"
      >
        <div class="aspect-video bg-gray-800 relative overflow-hidden group/thumb">
          <div class="absolute inset-0 bg-gradient-to-t from-gray-950/80 to-transparent"></div>
          
          <!-- Hover Overlay with Preview Button -->
          <div class="absolute inset-0 bg-gray-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6">
            <button 
              @click.stop="handlePreview(site.id)"
              class="px-8 py-3 bg-white text-gray-950 font-bold rounded-xl shadow-2xl transform scale-90 group-hover:scale-100 transition-all duration-300"
            >
              Preview Site
            </button>
          </div>

          <div class="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <span :class="[
              'px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded',
              site.published ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
            ]">
              {{ site.published ? 'Published' : 'Draft' }}
            </span>
          </div>
        </div>

        
        <div class="p-6">
          <h3 class="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
            {{ site.name }}
          </h3>
          <p class="text-gray-400 text-sm line-clamp-2 mb-6 h-10">
            {{ site.description || 'No description provided.' }}
          </p>
          
          <div class="flex items-center justify-between pt-4 border-t border-gray-800">
            <div class="flex items-center gap-4">
              <button @click="openEditor(site.id)" class="text-sm font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                Edit <ExternalLink class="w-3 h-3" />
              </button>
              <button @click="$router.push(`/site/${site.id}/dashboard`)" class="text-sm font-semibold text-gray-400 hover:text-white transition-colors">
                Pages
              </button>
            </div>


            <div class="flex items-center gap-2">
              <!-- Deployment Links -->
              <template v-if="site.published">
                <a 
                  v-if="site.repo_url"
                  :href="site.repo_url" 
                  target="_blank"
                  class="p-2 text-gray-500 hover:text-white transition-colors"
                  title="View Source on GitHub"
                >
                  <Github class="w-4 h-4" />
                </a>
                <a 
                  v-if="site.pages_url"
                  :href="site.pages_url" 
                  target="_blank"
                  class="p-2 text-gray-500 hover:text-primary transition-colors"
                  title="View Live Site"
                >
                  <Globe class="w-4 h-4" />
                </a>
                <div class="w-px h-4 bg-gray-800 mx-1"></div>
              </template>

              <button 
                @click="publishSite(site)" 
                class="p-2 text-gray-500 hover:text-primary transition-colors tooltip"
                :title="site.published ? 'Redeploy to GitHub' : 'Publish to GitHub'"
              >
                <Rocket class="w-4 h-4" />
              </button>
              <button @click="confirmDelete(site)" class="p-2 text-gray-500 hover:text-red-400 transition-colors">
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <MagicBuilder v-if="showMagicBuilder" @close="showMagicBuilder = false" />
    <PublishModal 
      v-if="showPublishModal && selectedSite" 
      :site-id="selectedSite.id" 
      :site-name="selectedSite.name" 
      @close="showPublishModal = false" 
    />
    <DeleteSiteModal
      v-if="showDeleteModal && selectedSite"
      :site-name="selectedSite.name"
      :deleting="isDeleting"
      @close="showDeleteModal = false"
      @confirm="handleExecuteDelete"
    />

    <!-- Create Site Modal (Blank) -->
    <div v-if="showCreateModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-gray-950/80 backdrop-blur-sm" @click="showCreateModal = false"></div>
      <div class="bg-gray-900 border border-gray-800 w-full max-w-md rounded-3xl p-8 relative shadow-2xl">
        <h2 class="text-2xl font-bold text-white mb-6">Create Blank Site</h2>
        <div class="space-y-6">
          <input v-model="newSiteName" placeholder="Site Name" class="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary" />
          <textarea v-model="newSiteDesc" placeholder="Description" class="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"></textarea>
        </div>
        <div class="flex gap-4 mt-8">
          <button @click="showCreateModal = false" class="flex-1 py-3 bg-gray-800 text-white rounded-xl">Cancel</button>
          <button @click="handleCreateSite" :disabled="!newSiteName || siteStore.loading" class="flex-1 py-3 bg-primary text-white rounded-xl">Create</button>
        </div>
      </div>
    </div>

    <!-- Site Templates Modal -->
    <div v-if="showTemplateModal" class="fixed inset-0 z-[100] flex items-center justify-center p-8">
      <div class="absolute inset-0 bg-gray-950/90 backdrop-blur-md" @click="showTemplateModal = false"></div>
      <div class="bg-gray-900 border border-gray-800 w-full max-w-5xl rounded-[40px] p-12 relative shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div class="mb-10">
          <h2 class="text-3xl font-black text-white mb-2">Select a Template</h2>
          <p class="text-gray-400">Choose a professionally designed structure to kickstart your project.</p>
        </div>
        <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div v-for="tpl in mockSiteTemplates" :key="tpl.id" 
              class="group bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden hover:border-primary transition-all cursor-pointer"
              @click="handleCreateFromTemplate(tpl)"
            >
              <div class="aspect-[4/3] bg-gray-800 flex items-center justify-center">
                <LayoutTemplate class="w-12 h-12 text-gray-700 group-hover:text-primary transition-colors" />
              </div>
              <div class="p-6">
                <h4 class="text-lg font-bold text-white mb-1">{{ tpl.name }}</h4>
                <p class="text-xs text-gray-500">{{ tpl.category }}</p>
              </div>
            </div>
          </div>
        </div>
        <button @click="showTemplateModal = false" class="mt-8 text-gray-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSiteStore } from '../../stores/siteStore'

import { useAuthStore } from '../../../auth/stores/authStore'
import { supabase } from '@/api/supabase/client'
import { Plus, Layout, ExternalLink, Trash2, LayoutTemplate, Wand2, Rocket, Github, Globe } from 'lucide-vue-next'


import { siteTemplateApi } from '@/api/endpoints/site-template.api'
import MagicBuilder from '../MagicBuilder/MagicBuilder.vue'
import PublishModal from '../../../deployment/components/PublishModal.vue'
import DeleteSiteModal from './DeleteSiteModal.vue'

const router = useRouter()
const route = useRoute()
const siteStore = useSiteStore()

const authStore = useAuthStore()

const showCreateModal = ref(false)
const showTemplateModal = ref(false)
const showMagicBuilder = ref(false)
const showPublishModal = ref(false)
const showDeleteModal = ref(false)
const isDeleting = ref(false)
const selectedSite = ref<any>(null)
const newSiteName = ref('')
const newSiteDesc = ref('')

const mockSiteTemplates = [
  { id: 'saas-1', name: 'SaaS Landing Page', category: 'Business' },
  { id: 'portfolio-1', name: 'Developer Portfolio', category: 'Personal' },
  { id: 'blog-1', name: 'Modern Blog', category: 'Content' }
]

// 监听路径变化，强制刷新数据
watch(() => route.path, (path) => {
  if (path === '/') {
    console.log('[Debug] Home path detected, fetching sites...')
    siteStore.fetchSites()
  }
}, { immediate: true })


const handleCreateSite = async () => {
  if (!newSiteName.value) return
  try {
    const site = await siteStore.createSite(newSiteName.value, newSiteDesc.value)
    showCreateModal.value = false
    newSiteName.value = ''
    newSiteDesc.value = ''
    router.push(`/site/${site.id}/dashboard`)
  } catch (error) {
    alert('Failed to create site.')
  }
}

const handleCreateFromTemplate = async (template: any) => {
  const name = prompt(`Enter a name for your new ${template.name}:`, `My ${template.name}`)
  if (!name) return
  try {
    const siteId = await siteTemplateApi.createSiteFromTemplate(template.id, name)
    router.push(`/site/${siteId}/dashboard`)
  } catch (error) {
    alert('Failed to create site from template.')
  }
}

const confirmDelete = (site: any) => {
  selectedSite.value = site
  showDeleteModal.value = true
}

const handleExecuteDelete = async () => {
  if (!selectedSite.value) return
  
  const site = selectedSite.value
  const isPublished = !!site.repo_id || !!site.repo_name
  
  isDeleting.value = true
  try {
    let token = ''
    if (isPublished && authStore.user) {
      const { data } = await supabase
        .from('profiles')
        .select('github_token')
        .eq('id', authStore.user.id)
        .single()
      token = data?.github_token || ''
      
      if (!token) {
        alert('GitHub token not found. Please reconnect your GitHub account to delete the repository.')
        isDeleting.value = false
        return
      }
    }
    
    await siteStore.deleteSite(site.id, token)
    showDeleteModal.value = false
    selectedSite.value = null
    alert('Site and repository deleted successfully.')
  } catch (error: any) {
    console.error('Delete failed:', error)
    alert(`Failed to delete site: ${error.message || 'Unknown error'}`)
  } finally {
    isDeleting.value = false
  }
}

const openEditor = (siteId: string) => {
  router.push(`/site/${siteId}/dashboard`)
}

const handlePreview = (siteId: string) => {
  window.open(`${import.meta.env.BASE_URL}preview/${siteId}`, '_blank')
}


const publishSite = (site: any) => {
  selectedSite.value = site
  showPublishModal.value = true
}
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
