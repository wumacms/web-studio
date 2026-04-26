<template>
  <div class="h-screen w-screen bg-gray-100 flex flex-col overflow-hidden">
    <!-- 预览工具栏 (始终显示) -->
    <nav class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-50 shrink-0 shadow-sm">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Eye class="w-4 h-4" />
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-black uppercase text-gray-400 tracking-widest leading-none mb-1">Previewing</span>
            <span class="font-bold text-gray-900 leading-none">{{ siteName }}</span>
          </div>
        </div>
        <div class="h-4 w-px bg-gray-200 mx-2"></div>
        <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button 
            v-for="mode in ['desktop', 'mobile']" 
            :key="mode"
            @click="viewMode = mode"
            :class="['p-1.5 rounded-md transition-all', viewMode === mode ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600']"
          >
            <Monitor v-if="mode === 'desktop'" class="w-4 h-4" />
            <Smartphone v-else class="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div class="flex items-center gap-6">
        <!-- 路径提示 (仅在有多个页面时显示) -->
        <div v-if="pages.length > 1" class="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-600">
          <FileText class="w-3.5 h-3.5 text-primary" />
          <span>{{ pages.find(p => p.id === currentPageId)?.name || 'Page' }}</span>
        </div>


        <div class="h-6 w-px bg-gray-200"></div>

        <!-- 语言切换 -->
        <div v-if="availableLocales.length > 1" class="flex items-center gap-2">
          <Languages class="w-4 h-4 text-primary" />
          <select v-model="currentLang" @change="handleLangChange" class="text-xs font-bold uppercase bg-transparent text-gray-700 focus:outline-none cursor-pointer">
            <option v-for="lang in availableLocales" :key="lang" :value="lang">{{ lang }}</option>
          </select>
        </div>

        <button @click="handleClose" class="p-2 text-gray-500 hover:text-red-500 transition-colors">
          <X class="w-5 h-5" />
        </button>
      </div>
    </nav>

    <!-- 沙盒预览区域 -->
    <main class="flex-1 relative bg-gray-200 overflow-hidden flex items-center justify-center p-4">
      <div 
        class="h-full bg-white shadow-2xl transition-all duration-500 ease-in-out relative overflow-hidden"
        :style="{ width: viewMode === 'mobile' ? '375px' : '100%', maxWidth: '100%' }"
      >
        <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
          <Loader2 class="w-8 h-8 text-primary animate-spin" />
        </div>
        <iframe
          ref="previewFrame"
          class="w-full h-full border-0"
          title="Site Preview Sandbox"
        ></iframe>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { templateAdapter, NormalizedPreviewData } from '@/shared/services/template-adapter.service'
import { siteApi } from '@/api/endpoints/site.api'
import { blockApi } from '@/api/endpoints/block.api'
import { siteGlobalsApi } from '@/api/endpoints/site-globals.api'
import Handlebars from 'handlebars'
import { Loader2, Languages, Monitor, Smartphone, X, Eye, FileText } from 'lucide-vue-next'
import type { BlockInstance } from '@/types/models/block'
import type { Page } from '@/types/models/site'

const route = useRoute()
const router = useRouter()

// 状态
const loading = ref(true)
const siteName = ref('Loading...')
const blocks = ref<BlockInstance[]>([])
const pages = ref<Page[]>([])
const navConfig = ref<any>(null)
const footerConfig = ref<any>(null)
const availableLocales = ref<string[]>([])
const currentLang = ref((route.query.lang as string) || 'en')
const viewMode = ref('desktop')
const previewFrame = ref<HTMLIFrameElement | null>(null)
const currentPageId = ref('')

const fetchData = async () => {
  loading.value = true
  try {
    let normalized: NormalizedPreviewData

    if (route.name === 'market-preview') {
      const { type, id } = route.params
      normalized = await templateAdapter.normalize(type as any, id as string)
    } else {
      // 传统 Site 预览逻辑
      const siteId = route.params.siteId as string
      const { data: siteData } = await siteApi.getSite(siteId)
      const globals = await siteGlobalsApi.getGlobals(siteId)
      const pagesData = await siteApi.getPages(siteId)
      
      normalized = {
        siteName: siteData.name,
        globals: {
          nav_config: globals?.nav_config,
          footer_config: globals?.footer_config,
          i18n_config: globals?.i18n_config
        },
        pages: await Promise.all(pagesData.map(async (p) => ({
          ...p,
          blocks: await blockApi.getPageBlocks(p.id)
        })))
      }
    }

    // 映射到状态
    siteName.value = normalized.siteName
    pages.value = normalized.pages as any
    navConfig.value = normalized.globals.nav_config
    footerConfig.value = normalized.globals.footer_config
    availableLocales.value = normalized.globals.i18n_config?.enabled || ['en']
    
    // 设置当前页面
    const requestedPageId = route.params.pageId as string
    let targetPage = normalized.pages.find(p => p.id === requestedPageId || p.path === requestedPageId)
    if (!targetPage) targetPage = normalized.pages[0]
    
    if (targetPage) {
      currentPageId.value = targetPage.id
      blocks.value = targetPage.blocks
    }

    await nextTick()
    updateIframeContent()
  } catch (error) {
    console.error('Preview load failed:', error)
  } finally {
    loading.value = false
  }
}


const renderBlockHtml = (block: BlockInstance) => {
  try {
    const template = Handlebars.compile(block.copied_html_code)
    const displayProps = (currentLang.value !== 'en' && block.translations?.[currentLang.value]) 
      ? block.translations[currentLang.value] 
      : block.props_data
    return template(displayProps)
  } catch (error) {
    return `<div style="color: red; padding: 20px;">Error rendering block: ${block.id}</div>`
  }
}

const updateIframeContent = () => {
  if (!previewFrame.value) return
  
  const doc = previewFrame.value.contentDocument
  if (!doc) return

  const blocksHtml = blocks.value.map(renderBlockHtml).join('')
  
  // 生成导航栏 HTML (沙盒内渲染以保证样式一致)
  const navHtml = navConfig.value ? `
    <nav class="py-4 px-8 border-b border-gray-100 bg-white sticky top-0 z-40">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3">
          ${navConfig.value.logo ? `<img src="${navConfig.value.logo}" class="h-8 w-auto" />` : ''}
          <span class="font-bold text-xl tracking-tight">${navConfig.value.site_name || siteName.value}</span>
        </div>
        <div class="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          ${pages.value.map(p => `
            <a href="javascript:void(0)" 
               onclick="window.parent.postMessage({ type: 'NAVIGATE', pageId: '${p.id}' }, '*')"
               class="hover:text-blue-600 transition-colors">
              ${(currentLang.value !== 'en' && p.translations?.[currentLang.value]) || p.name}
            </a>
          `).join('')}
        </div>
        ${navConfig.value.cta_button?.text ? `
          <a href="${navConfig.value.cta_button.link || '#'}" class="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-full shadow-lg transition-transform hover:scale-105">
            ${navConfig.value.cta_button.text}
          </a>
        ` : ''}
      </div>
    </nav>
  ` : ''

  const footerHtml = footerConfig.value ? `
    <footer class="py-16 px-8 border-t border-gray-100 bg-gray-50">
      <div class="max-w-7xl mx-auto text-center">
        <div class="mb-8 font-bold text-lg opacity-50">${navConfig.value?.site_name || siteName.value}</div>
        <p class="text-sm text-gray-500">${footerConfig.value.copyright || ''}</p>
      </div>
    </footer>
  ` : ''

  const fullHtml = `
    <!DOCTYPE html>
    <html lang="${currentLang.value}">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <script src="https://cdn.tailwindcss.com"><\/script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
      <script>
        tailwind.config = {
          theme: {
            extend: {
              fontFamily: {
                sans: ['Inter', 'sans-serif'],
              },
              colors: {
                primary: '#3b82f6',
                secondary: '#10b981',
              }
            }
          }
        }
      <\/script>
      <style>
        body { font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
        .editor-canvas-reset h1, .editor-canvas-reset h2, .editor-canvas-reset h3 { margin: 0; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #bbb; }
        a { cursor: pointer; }
      </style>
    </head>
    <body>
      <div class="editor-canvas-reset">
        ${navHtml}
        <main>${blocksHtml}</main>
        ${footerHtml}
      </div>
    </body>
    </html>
  `

  doc.open()
  doc.write(fullHtml)
  doc.close()
}

const handleMessage = (event: MessageEvent) => {
  if (event.data?.type === 'NAVIGATE' && event.data.pageId) {
    handlePageChange(event.data.pageId)
  }
}

onMounted(() => {
  fetchData()
  window.addEventListener('message', handleMessage)
})

onUnmounted(() => {
  window.removeEventListener('message', handleMessage)
})

watch(() => route.params.pageId, () => {
  fetchData()
})

watch(() => route.params.id, () => {
  fetchData()
})

watch(() => currentLang.value, () => updateIframeContent())

const handlePageChange = (id: string) => {
  router.push({ params: { pageId: id }, query: route.query })
}

const handleLangChange = () => {
  router.push({ query: { ...route.query, lang: currentLang.value } })
}

const handleClose = () => {
  // 尝试关闭窗口（如果是由 window.open 打开的）
  if (window.opener) {
    window.close()
  } else {
    // 否则返回上一页或主页
    if (route.name === 'market-preview') {
      const type = (route.params.type as string || 'block').toLowerCase()
      router.push(`/marketplace/${type}`)
    } else {
      router.back()
    }

  }
}

</script>

<style scoped>
/* 针对预览界面的微调 */
</style>
