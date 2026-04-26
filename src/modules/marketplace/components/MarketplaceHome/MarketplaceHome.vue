<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <!-- Hero Section -->
    <div class="text-center mb-20">
      <h1 class="text-5xl font-black text-white mb-6 tracking-tight">
        Asset <span class="text-primary italic">Marketplace</span>
      </h1>
      <p class="text-gray-400 text-xl max-w-2xl mx-auto">
        Discover premium blocks, templates, and designs to accelerate your web development.
      </p>
    </div>

    <!-- Type Switcher -->
    <div class="flex justify-center mb-12">
      <div class="inline-flex p-1 bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl">
        <button 
          v-for="type in ['BLOCK', 'PAGE', 'SITE']" 
          :key="type"
          @click="router.push(`/marketplace/${type.toLowerCase()}`)"
          :class="[
            'px-8 py-3 text-xs font-black tracking-widest uppercase rounded-xl transition-all',
            marketStore.currentType === type 
              ? 'bg-primary text-white shadow-lg shadow-primary/20' 
              : 'text-gray-500 hover:text-white'
          ]"
        >

          {{ type }}S
        </button>
      </div>
    </div>

    <!-- Categories & Search -->
    <div class="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
      <div class="flex items-center gap-2 p-1 bg-gray-900 border border-gray-800 rounded-2xl overflow-x-auto max-w-full">
        <button 
          v-for="cat in marketStore.categories" 
          :key="cat"
          @click="marketStore.setCategory(cat)"
          :class="[
            'px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap',
            marketStore.currentCategory === cat 
              ? 'bg-gray-800 text-white border border-gray-700' 
              : 'text-gray-500 hover:text-white'
          ]"
        >
          {{ cat }}
        </button>
      </div>
      
      <div class="relative w-full md:w-80">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input 
          type="text" 
          placeholder="Search assets..." 
          class="w-full bg-gray-900 border border-gray-800 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
        />
      </div>
    </div>

    <!-- Grid -->
    <div v-if="marketStore.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
      <div v-for="i in 6" :key="i" class="animate-pulse bg-gray-900 border border-gray-800 rounded-3xl h-80"></div>
    </div>

    <div v-else-if="marketStore.items.length === 0" class="py-32 text-center">
      <div class="w-20 h-20 bg-gray-900 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-700">
        <Box class="w-10 h-10" />
      </div>
      <h3 class="text-xl font-bold text-white mb-2">No items found</h3>
      <p class="text-gray-500">Try switching categories or check back later.</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
      <div 
        v-for="item in marketStore.items" 
        :key="item.id"
        class="group bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-primary/5 duration-500"
      >
        <!-- Preview -->
        <div class="aspect-video bg-gray-950 relative overflow-hidden">
          <img v-if="item.preview_image" :src="item.preview_image" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          <div v-else class="w-full h-full flex flex-col items-center justify-center text-gray-800">
            <Layout class="w-16 h-16 mb-2 opacity-10" />
            <span class="text-[10px] font-mono tracking-widest uppercase opacity-20">No Preview</span>
          </div>
          
          <!-- Favorite Toggle -->
          <button 
            @click.stop="marketStore.toggleFavorite(item.id)"
            class="absolute top-4 right-4 p-2.5 bg-gray-900/80 backdrop-blur-md rounded-xl border border-gray-700/50 hover:border-primary transition-all z-10"
          >
            <Heart 
              class="w-4 h-4 transition-colors" 
              :class="marketStore.favoriteIds.includes(item.id) ? 'text-primary fill-primary' : 'text-gray-500'" 
            />
          </button>

          <div class="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">

            <button 
              @click.stop="$router.push(`/preview/market/${marketStore.currentType}/${item.id}`)"
              class="w-full py-3 bg-white text-gray-950 font-bold rounded-xl shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500"
            >
              Preview Design
            </button>

          </div>
        </div>

        <!-- Info -->
        <div class="p-8">
          <div class="flex items-center justify-between mb-4">
            <span class="px-3 py-1 bg-gray-800 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-gray-700">
              {{ item.category || 'Uncategorized' }}
            </span>
            <span class="text-sm font-bold text-primary">Free</span>
          </div>
          
          <h3 class="text-2xl font-bold text-white mb-3 group-hover:text-primary transition-colors">
            {{ item.name }}
          </h3>
          
          <div class="flex items-center justify-between pt-6 border-t border-gray-800 mt-2">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-500">
                S
              </div>
              <span class="text-xs text-gray-500">Web Studio Team</span>
            </div>
            <div class="flex items-center gap-4">
              <button 
                v-if="item.created_by === authStore.user?.id"
                @click="marketStore.deleteItem(item.id)"
                class="p-2 text-gray-500 hover:text-red-500 transition-colors"
                title="Delete Template"
              >
                <Trash2 class="w-4 h-4" />
              </button>
              <button 
                @click="marketStore.addToLibrary(item)"
                class="flex items-center gap-2 text-sm font-bold text-white hover:text-primary transition-colors"
              >
                <Copy class="w-4 h-4" /> Clone
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'

import { useRoute, useRouter } from 'vue-router'
import { useMarketStore } from '../../stores/marketStore'
import { useAuthStore } from '@/modules/auth/stores/authStore'
import { Search, Layout, Box, Heart, Trash2, Copy } from 'lucide-vue-next'


const marketStore = useMarketStore()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

// 监听路径变化，强制刷新并同步状态
// 监听路径和参数变化，同步状态并请求数据
watch(() => [route.path, route.params.type], ([path, type]) => {
  if ((path as string).startsWith('/marketplace')) {
    const typeFromPath = (type as string) || 'block'
    const newType = typeFromPath.toUpperCase() as any
    
    // 只有当类型确实改变了，或者当前没有数据时才触发获取
    marketStore.currentType = newType
    console.log('[Debug] Marketplace navigation detected:', { path, type: newType })
    marketStore.fetchItems()
  }
}, { immediate: true })


onMounted(() => {
  if (!route.params.type) {
    router.replace('/marketplace/block')
  } else if (marketStore.items.length === 0) {
    marketStore.fetchItems()
  }
})


</script>


