import { defineStore } from 'pinia'
import { ref } from 'vue'
import { siteApi } from '@/api/endpoints/site.api'
import { siteGlobalsApi } from '@/api/endpoints/site-globals.api'
import { blockApi } from '@/api/endpoints/block.api'
import { pageTemplateApi } from '@/api/endpoints/page-template.api'
import { siteTemplateApi } from '@/api/endpoints/site-template.api'
import { githubPagesService, slugify } from '@/modules/deployment/services/githubPagesService'
import type { Site, Page, SiteGlobals } from '@/types/models/site'

export const useSiteStore = defineStore('site', () => {
  const sites = ref<Site[]>([])
  const currentSite = ref<Site | null>(null)
  const currentGlobals = ref<SiteGlobals | null>(null)
  const pages = ref<Page[]>([])
  const loading = ref(false)

  async function fetchSites() {
    loading.value = true
    try {
      sites.value = await siteApi.getSites()
    } catch (error) {
      console.error('Failed to fetch sites:', error)
    } finally {
      loading.value = false
    }
  }

  async function fetchSiteDetails(siteId: string) {
    loading.value = true
    try {
      const { data } = await siteApi.getSite(siteId)
      currentSite.value = data
      currentGlobals.value = await siteGlobalsApi.getGlobals(siteId)
      pages.value = await siteApi.getPages(siteId)
    } catch (error) {
      console.error('Failed to fetch site details:', error)
    } finally {
      loading.value = false
    }
  }

  async function saveGlobals(globals: Partial<SiteGlobals>) {
    if (!currentSite.value) return
    try {
      const updated = await siteGlobalsApi.upsertGlobals({
        ...globals,
        site_id: currentSite.value.id
      })
      currentGlobals.value = updated
    } catch (error) {
      console.error('Failed to save globals:', error)
      throw error
    }
  }

  async function createSite(name: string, description: string, githubToken?: string) {
    loading.value = true
    try {
      const repo_name = slugify(name)
      let repo_id = ''
      let repo_full_name = ''
      let repo_url = ''

      // 1. Create GitHub repo first if token is available
      if (githubToken) {
        const { repo } = await githubPagesService.createRepo(githubToken, repo_name)
        repo_id = repo.id.toString()
        repo_full_name = repo.full_name
        repo_url = repo.html_url
      }

      // 2. Create site record with repo info
      const newSite = await siteApi.createSite({ 
        name, 
        description, 
        repo_name,
        repo_id,
        repo_full_name,
        repo_url
      })
      
      sites.value.unshift(newSite)
      return newSite
    } catch (error) {
      console.error('Failed to create site:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function deleteSite(id: string, githubToken?: string) {
    const site = sites.value.find(s => s.id === id)
    
    // 1. Delete GitHub Repo first if it exists
    const repoIdentifier = site?.repo_id || site?.repo_name
    if (githubToken && repoIdentifier) {
      try {
        await githubPagesService.deleteRepo(githubToken, repoIdentifier)
      } catch (error) {
        console.error('Failed to delete GitHub repository:', error)
        throw error // Propagate error so we don't delete the site record if repo deletion fails
      }
    }
    
    // 2. Delete site record from database
    await siteApi.deleteSite(id)
    
    // 3. Update local state
    sites.value = sites.value.filter(s => s.id !== id)
  }

  async function fetchPages(siteId: string) {
    pages.value = await siteApi.getPages(siteId)
  }

  async function createPage(siteId: string, name: string, path: string) {
    loading.value = true
    try {
      const newPage = await siteApi.createPage({
        site_id: siteId,
        name,
        path,
        sort_order: pages.value.length
      })
      pages.value.push(newPage)
      return newPage
    } catch (error) {
      console.error('Failed to create page:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function updatePage(id: string, updates: Partial<Page>) {
    loading.value = true
    try {
      const updated = await siteApi.updatePage(id, updates)
      const index = pages.value.findIndex(p => p.id === id)
      if (index !== -1) pages.value[index] = updated
      return updated
    } catch (error) {
      console.error('Failed to update page:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function publishPageAsTemplate(pageId: string, name: string, category: string) {
    loading.value = true
    try {
      const blocks = await blockApi.getPageBlocks(pageId)
      // Clean blocks: remove IDs and page_id to make them generic
      const cleanBlocks = blocks.map(({ id, page_id, ...rest }) => rest)
      
      await pageTemplateApi.createPageTemplate({
        name,
        category,
        blocks: cleanBlocks,
        is_published: true
      })
    } catch (error) {
      console.error('Failed to publish page template:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function publishSiteAsTemplate(siteId: string, name: string, category: string) {
    loading.value = true
    try {
      const sitePages = await siteApi.getPages(siteId)
      const templatePages = await Promise.all(sitePages.map(async (p) => {
        const blocks = await blockApi.getPageBlocks(p.id)
        const cleanBlocks = blocks.map(({ id, page_id, ...rest }) => rest)
        return {
          name: p.name,
          path: p.path,
          blocks: cleanBlocks
        }
      }))

      const globals = await siteGlobalsApi.getGlobals(siteId)

      await siteTemplateApi.createSiteTemplate({
        name,
        category,
        pages: templatePages,
        nav_config: globals?.nav_config,
        footer_config: globals?.footer_config,
        i18n_config: globals?.i18n_config,
        is_published: true
      })

    } catch (error) {
      console.error('Failed to publish site template:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    sites,
    currentSite,
    currentGlobals,
    pages,
    loading,
    fetchSites,
    fetchSiteDetails,
    saveGlobals,
    createSite,
    deleteSite,
    fetchPages,
    createPage,
    updatePage,
    publishPageAsTemplate,
    publishSiteAsTemplate
  }
})

