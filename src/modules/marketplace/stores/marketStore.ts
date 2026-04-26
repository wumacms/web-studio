import { defineStore } from 'pinia'
import { ref } from 'vue'
import { marketApi, MarketItemType } from '@/api/endpoints/market.api'
import { useAuthStore } from '@/modules/auth/stores/authStore'
import { templateApi } from '@/api/endpoints/template.api'
import { pageTemplateApi } from '@/api/endpoints/page-template.api'
import { siteTemplateApi } from '@/api/endpoints/site-template.api'
import { favoritesApi } from '@/api/endpoints/favorites.api'

export const useMarketStore = defineStore('market', () => {
  const items = ref<any[]>([])
  const favoriteIds = ref<string[]>([])
  const loading = ref(false)
  const currentType = ref<MarketItemType>('BLOCK')
  const categories = ref(['All', 'Header', 'Hero', 'Features', 'Testimonials', 'Pricing', 'Footer', 'Blog', 'Portfolio', 'Business'])
  const currentCategory = ref('All')

  async function fetchItems() {
    loading.value = true
    try {
      const authStore = useAuthStore()
      const userId = authStore.user?.id || ''

      const [marketItems, favs] = await Promise.all([
        marketApi.getMarketItems(currentType.value, currentCategory.value),
        userId ? favoritesApi.getFavorites(userId) : Promise.resolve([])
      ])
      items.value = marketItems
      favoriteIds.value = (favs || []).filter(f => f.item_type === currentType.value).map(f => f.item_id)

    } catch (error) {
      console.error('Failed to fetch market items:', error)
    } finally {
      loading.value = false
    }
  }

  async function toggleFavorite(itemId: string) {
    const authStore = (await import('@/modules/auth/stores/authStore')).useAuthStore()
    const userId = authStore.user?.id
    if (!userId) {
      alert('Please sign in to favorite items.')
      return
    }

    try {
      const isFav = await favoritesApi.toggleFavorite(userId, currentType.value, itemId)
      if (isFav) {
        favoriteIds.value.push(itemId)
      } else {
        favoriteIds.value = favoriteIds.value.filter(id => id !== itemId)
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }


  async function addToLibrary(item: any) {
    try {
      if (currentType.value === 'BLOCK') {
        await templateApi.createTemplate({
          name: item.name,
          html_code: item.html_code,
          schema: item.schema,
          category: item.category,
          preview_image: item.preview_image,
          origin: 'USER',
          is_published: false
        })
      } else if (currentType.value === 'PAGE') {
        await pageTemplateApi.createPageTemplate({
          name: item.name,
          blocks: item.blocks,
          category: item.category,
          preview_image: item.preview_image,
          is_published: false
        })
      } else if (currentType.value === 'SITE') {
        const siteId = await siteTemplateApi.createSiteFromTemplate(item.id, `Copy of ${item.name}`)
        alert(`New site cloned from template! Redirecting...`)
        window.location.href = `/site/${siteId}/dashboard`
        return
      }
      alert(`${item.name} cloned to your library!`)
    } catch (error) {
      console.error('Failed to clone:', error)
      alert('Failed to clone.')
    }
  }

  async function deleteItem(itemId: string) {
    if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) return
    
    try {
      await marketApi.deleteMarketItem(currentType.value, itemId)
      items.value = items.value.filter(i => i.id !== itemId)
      alert('Template deleted successfully.')
    } catch (error: any) {
      console.error('Failed to delete item:', error)
      alert(`Failed to delete: ${error.message || 'Permission denied'}`)
    }
  }


  function setType(type: MarketItemType) {
    currentType.value = type
    fetchItems()
  }

  function setCategory(category: string) {
    currentCategory.value = category
    fetchItems()
  }

  return {
    items,
    favoriteIds,
    loading,
    currentType,
    categories,
    currentCategory,
    fetchItems,
    setType,
    setCategory,
    addToLibrary,
    toggleFavorite,
    deleteItem
  }

})


