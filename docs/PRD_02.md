## 系统架构升级方案

### 一、整体架构分层

```
┌─────────────────────────────────────────────────────────────┐
│                        展示层 (View Layer)                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │ 通用UI组件库  │ │ 业务视图组件  │ │    页面/路由层       │ │
│  └──────────────┘ └──────────────┘ └──────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                      状态管理层 (State Layer)                   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │  Pinia Stores │ │  Composables │ │  响应式数据流        │ │
│  └──────────────┘ └──────────────┘ └──────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                       业务逻辑层 (Service Layer)                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │ 核心业务模块  │ │ 领域服务模块  │ │   工具/帮助模块      │ │
│  └──────────────┘ └──────────────┘ └──────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                         API层 (API Layer)                       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │ HTTP Client  │ │ Supabase SDK  │ │ GitHub API Client    │ │
│  └──────────────┘ └──────────────┘ └──────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                      基础设施层 (Infrastructure)                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │  Supabase     │ │   GitHub API  │ │   仓库/存储          │ │
│  └──────────────┘ └──────────────┘ └──────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

### 二、模块化架构设计

#### 2.1 核心模块划分

```
src/
├── modules/                          # 业务模块（高内聚、低耦合）
│   ├── auth/                         # 认证模块
│   │   ├── components/               # 视图组件
│   │   ├── composables/              # 组合式函数
│   │   ├── services/                 # 业务服务
│   │   ├── stores/                   # 状态管理
│   │   ├── types/                    # 类型定义
│   │   └── index.ts                  # 模块导出
│   │
│   ├── site-builder/                 # 网站构建器模块（核心）
│   │   ├── components/
│   │   │   ├── SiteDashboard/        # 网站仪表盘
│   │   │   ├── PageManager/          # 页面管理
│   │   │   └── SiteSettings/         # 网站设置（SEO、导航、页脚）
│   │   ├── composables/
│   │   ├── services/
│   │   ├── stores/
│   │   └── types/
│   │
│   ├── page-editor/                  # 页面编辑器模块（核心）
│   │   ├── components/
│   │   │   ├── BlockLibrary/         # 左侧：区块物料库
│   │   │   ├── EditorCanvas/         # 中间：可视化画布
│   │   │   ├── PropsPanel/           # 右侧：属性配置面板
│   │   │   └── BlockRenderer/        # 区块渲染器
│   │   ├── composables/
│   │   │   ├── useDragAndDrop.ts     # 拖拽逻辑
│   │   │   ├── useBlockSelection.ts  # 区块选中逻辑
│   │   │   └── useBlockRendering.ts  # 区块渲染逻辑
│   │   ├── services/
│   │   │   ├── blockService.ts       # 区块CRUD操作
│   │   │   └── renderEngine.ts       # Handlebars渲染引擎
│   │   ├── stores/
│   │   │   └── editorStore.ts        # 编辑器核心状态
│   │   └── types/
│   │
│   ├── template-market/              # 模板市场模块
│   │   ├── components/
│   │   ├── services/
│   │   ├── stores/
│   │   └── types/
│   │
│   ├── ai-builder/                   # AI建站模块
│   │   ├── components/
│   │   ├── services/
│   │   │   └── aiGenerationService.ts
│   │   └── types/
│   │
│   ├── deployment/                   # 部署与发布模块
│   │   ├── components/
│   │   ├── services/
│   │   │   ├── githubPagesService.ts
│   │   │   └── staticSiteGenerator.ts
│   │   └── types/
│   │
│   └── admin/                        # 管理后台模块
│       ├── components/
│       │   └── TemplateManager/      # 区块模板管理
│       ├── services/
│       └── types/
│
├── shared/                           # 共享资源
│   ├── components/                   # 通用UI组件库
│   │   ├── ui/                       # 基础UI组件
│   │   │   ├── Button/
│   │   │   ├── Modal/
│   │   │   ├── Input/
│   │   │   ├── Select/
│   │   │   └── ...
│   │   ├── JsonSchemaForm/           # JSON Schema动态表单组件
│   │   ├── CodeEditor/               # 代码编辑器组件
│   │   └── DragDrop/                 # 拖拽容器组件
│   │
│   ├── composables/                  # 通用组合式函数
│   │   ├── useDebounce.ts
│   │   ├── useThrottle.ts
│   │   ├── useClipboard.ts
│   │   └── useMediaQuery.ts
│   │
│   └── utils/                        # 工具函数库
│       ├── http.ts                    # HTTP请求封装
│       ├── storage.ts                # 本地存储封装
│       ├── validators.ts             # 数据校验
│       ├── formatters.ts             # 数据格式化
│       ├── seo.ts                    # SEO工具函数
│       ├── navigation.ts            # 导航菜单生成器
│       └── schema.ts                 # JSON Schema工具
│
├── api/                              # API层
│   ├── client.ts                     # API客户端基础封装
│   ├── interceptors.ts               # 请求/响应拦截器
│   ├── endpoints/                    # API端点定义
│   │   ├── auth.api.ts
│   │   ├── site.api.ts
│   │   ├── page.api.ts
│   │   ├── block.api.ts
│   │   ├── template.api.ts
│   │   ├── deployment.api.ts
│   │   └── ai.api.ts
│   └── supabase/                     # Supabase配置与封装
│       ├── client.ts
│       ├── queries.ts
│       └── realtime.ts
│
├── types/                            # 全局类型定义
│   ├── models/                       # 数据模型
│   │   ├── user.ts
│   │   ├── site.ts
│   │   ├── page.ts
│   │   ├── block.ts
│   │   └── template.ts
│   └── enums/                        # 枚举定义
│
├── constants/                        # 常量定义
│   └── index.ts
│
├── plugins/                          # Vue插件
│   └── index.ts
│
├── router/                           # 路由配置
│   └── index.ts
│
├── App.vue
└── main.ts
```

---

### 2.2 模块接口规范

每个模块必须暴露统一的接口：

```typescript
// modules/site-builder/index.ts - 模块导出示例
import * as components from './components'
import * as services from './services'
import * as stores from './stores'
import * as types from './types'

export const SiteBuilderModule = {
  components,
  services,
  stores,
  types
}

// 类型安全的模块API
export type SiteBuilderAPI = {
  createSite: typeof services.createSite
  updateSiteSettings: typeof services.updateSiteSettings
  deleteSite: typeof services.deleteSite
  // ... 其他API
}
```

---

### 三、数据与视图分离设计

#### 3.1 数据层（Data Layer）

```typescript
// modules/page-editor/stores/editorStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BlockInstance, Page, DragState } from '../types'

/**
 * 编辑器状态管理 - 纯数据层
 * 职责：管理编辑器运行时数据，不包含任何UI逻辑
 */
export const useEditorStore = defineStore('page-editor', () => {
  // ============ 核心状态（纯数据） ============
  const currentPage = ref<Page | null>(null)
  const blockInstances = ref<BlockInstance[]>([])
  const selectedBlockId = ref<string | null>(null)
  const dragState = ref<DragState>({
    isDragging: false,
    draggedTemplate: null,
    dropIndex: -1
  })
  const isDirty = ref(false)               // 是否有未保存的修改
  const undoStack = ref<any[]>([])          // 撤销栈
  const redoStack = ref<any[]>([])          // 重做栈

  // ============ 计算属性（纯数据派生） ============
  const selectedBlock = computed(() => 
    blockInstances.value.find(b => b.id === selectedBlockId.value) ?? null
  )

  const sortedBlocks = computed(() => 
    [...blockInstances.value].sort((a, b) => a.sort_order - b.sort_order)
  )

  // ============ 数据操作方法 ============
  function addBlock(instance: BlockInstance) { /* ... */ }
  function removeBlock(id: string) { /* ... */ }
  function updateBlockProps(id: string, props: Record<string, any>) { /* ... */ }
  function moveBlock(fromIndex: number, toIndex: number) { /* ... */ }
  function selectBlock(id: string | null) { /* ... */ }
  function undo() { /* ... */ }
  function redo() { /* ... */ }
  function saveSnapshot() { /* ... */ }

  return {
    // 状态（只读）
    currentPage,
    blockInstances,
    selectedBlockId,
    dragState,
    isDirty,
    // 计算属性
    selectedBlock,
    sortedBlocks,
    // 方法
    addBlock,
    removeBlock,
    updateBlockProps,
    moveBlock,
    selectBlock,
    undo,
    redo,
    saveSnapshot
  }
})
```

#### 3.2 视图层（View Layer）

```vue
<!-- modules/page-editor/components/EditorCanvas/EditorCanvas.vue -->
<template>
  <div 
    class="editor-canvas"
    :class="{ 'is-dragging-over': isDragOver }"
    @dragover.prevent="onDragOver"
    @dragleave="onDragLeave"
    @drop.prevent="onDrop"
  >
    <!-- 视图只负责渲染，数据来自store -->
    <BlockRenderer
      v-for="block in sortedBlocks"
      :key="block.id"
      :block="block"
      :is-selected="block.id === selectedBlockId"
      @select="handleBlockSelect(block.id)"
    />
    
    <!-- 空状态 -->
    <EmptyCanvasPlaceholder v-if="sortedBlocks.length === 0" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEditorStore } from '../../stores/editorStore'
import { useDragAndDrop } from '../../composables/useDragAndDrop'
import BlockRenderer from '../BlockRenderer/BlockRenderer.vue'
import EmptyCanvasPlaceholder from './EmptyCanvasPlaceholder.vue'

/**
 * 编辑器画布组件 - 纯视图层
 * 职责：渲染UI、处理用户交互、委托业务逻辑给store和composables
 * 不直接操作数据
 */
const editorStore = useEditorStore()
const { isDragOver, onDragOver, onDragLeave, onDrop } = useDragAndDrop()

// 从store获取数据，保持单向数据流
const { sortedBlocks, selectedBlockId } = editorStore

function handleBlockSelect(id: string) {
  editorStore.selectBlock(id)
}
</script>
```

#### 3.3 Composables（行为逻辑层）

```typescript
// modules/page-editor/composables/useDragAndDrop.ts
import { ref } from 'vue'
import { useEditorStore } from '../stores/editorStore'
import type { BlockTemplate } from '../../template-market/types'

/**
 * 拖拽逻辑组合式函数
 * 封装拖拽相关行为，隔离UI事件处理
 */
export function useDragAndDrop() {
  const editorStore = useEditorStore()
  const isDragOver = ref(false)

  function onDragStart(template: BlockTemplate) {
    editorStore.dragState = {
      isDragging: true,
      draggedTemplate: template,
      dropIndex: -1
    }
  }

  function onDragOver(event: DragEvent) {
    isDragOver.value = true
    // 计算drop位置...
  }

  function onDragLeave() {
    isDragOver.value = false
  }

  function onDrop(event: DragEvent) {
    isDragOver.value = false
    const template = editorStore.dragState.draggedTemplate
    if (!template) return

    // 基于模板创建独立的区块实例
    const newInstance = createBlockInstance(template)
    editorStore.addBlock(newInstance)
    editorStore.dragState = { isDragging: false, draggedTemplate: null, dropIndex: -1 }
  }

  return {
    isDragOver,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop
  }
}

// 纯函数：创建区块实例
function createBlockInstance(template: BlockTemplate): BlockInstance {
  return {
    id: generateId(),
    source_template_id: template.id,
    copied_html_code: template.html_code,
    copied_schema: template.schema,
    props_data: extractDefaults(template.schema),
    sort_order: Date.now()
  }
}
```

---

### 四、独立的API层设计

#### 4.1 API客户端封装

```typescript
// api/client.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/modules/auth/stores/authStore'

/**
 * API客户端基础类
 * 封装通用请求逻辑：认证、错误处理、重试等
 */
class ApiClient {
  private instance: AxiosInstance

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' }
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // 请求拦截器：自动注入认证信息
    this.instance.interceptors.request.use((config) => {
      const authStore = useAuthStore()
      if (authStore.session) {
        config.headers.Authorization = `Bearer ${authStore.session.access_token}`
      }
      return config
    })

    // 响应拦截器：统一错误处理
    this.instance.interceptors.response.use(
      (response) => response.data,
      (error) => {
        this.handleError(error)
        return Promise.reject(error)
      }
    )
  }

  private handleError(error: any) {
    // 统一错误处理逻辑...
  }

  // 通用请求方法
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get(url, config)
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.post(url, data, config)
  }

  // ... put, delete, patch
}

export const apiClient = new ApiClient(import.meta.env.VITE_API_BASE_URL)
```

#### 4.2 API端点模块化

```typescript
// api/endpoints/site.api.ts
import { apiClient } from '../client'
import { supabase } from '../supabase/client'
import type { Site, SiteCreateInput, SiteUpdateInput, SiteGlobals } from '@/types/models/site'

/**
 * 网站API模块
 * 所有网站相关的API调用集中管理
 */
export const siteApi = {
  // ============ RESTful API（自定义Edge Functions） ============
  async getSites(): Promise<Site[]> {
    return apiClient.get('/sites')
  },

  async getSite(id: string): Promise<Site> {
    return apiClient.get(`/sites/${id}`)
  },

  async createSite(input: SiteCreateInput): Promise<Site> {
    return apiClient.post('/sites', input)
  },

  async updateSite(id: string, input: SiteUpdateInput): Promise<Site> {
    return apiClient.put(`/sites/${id}`, input)
  },

  async deleteSite(id: string): Promise<void> {
    return apiClient.delete(`/sites/${id}`)
  },

  // ============ Supabase 直接调用（实时、RLS保护） ============
  async getSitesRealtime() {
    return supabase
      .from('sites')
      .select('*')
      .order('created_at', { ascending: false })
  },

  async subscribeToSiteChanges(siteId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`site-${siteId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'sites', filter: `id=eq.${siteId}` }, 
        callback
      )
      .subscribe()
  },

  // ============ GitHub Pages 发布 ============
  async publishToGitHubPages(siteId: string, customDomain?: string): Promise<{
    repoUrl: string
    pagesUrl: string
  }> {
    return apiClient.post(`/sites/${siteId}/publish`, { customDomain })
  },

  // ============ 站点全局设置 ============
  async updateSiteGlobals(siteId: string, globals: Partial<SiteGlobals>): Promise<SiteGlobals> {
    return apiClient.put(`/sites/${siteId}/globals`, globals)
  },

  async getSiteGlobals(siteId: string): Promise<SiteGlobals> {
    return apiClient.get(`/sites/${siteId}/globals`)
  }
}
```

```typescript
// api/endpoints/block.api.ts
import { apiClient } from '../client'
import type { BlockInstance, BlockTemplate } from '@/types/models/block'

export const blockApi = {
  // 区块实例API（页面编辑器使用）
  async getPageBlocks(pageId: string): Promise<BlockInstance[]> {
    return apiClient.get(`/pages/${pageId}/blocks`)
  },

  async createBlock(pageId: string, block: Partial<BlockInstance>): Promise<BlockInstance> {
    return apiClient.post(`/pages/${pageId}/blocks`, block)
  },

  async updateBlockProps(blockId: string, props: Record<string, any>): Promise<BlockInstance> {
    return apiClient.patch(`/blocks/${blockId}`, { props_data: props })
  },

  async deleteBlock(blockId: string): Promise<void> {
    return apiClient.delete(`/blocks/${blockId}`)
  },

  async reorderBlocks(pageId: string, blockIds: string[]): Promise<void> {
    return apiClient.put(`/pages/${pageId}/blocks/reorder`, { blockIds })
  },

  // 区块模板API（模板市场/管理后台使用）
  async getTemplates(category?: string): Promise<BlockTemplate[]> {
    return apiClient.get('/templates', { params: { category } })
  },

  async createTemplate(template: Partial<BlockTemplate>): Promise<BlockTemplate> {
    return apiClient.post('/templates', template)
  }
}
```

---

### 五、工具函数库封装

```typescript
// shared/utils/index.ts - 工具函数统一导出
export * from './navigation'
export * from './seo'
export * from './schema'
export * from './template'
export * from './deployment'
export * from './validators'
export * from './formatters'
export * from './id-generator'
```

#### 5.1 导航菜单生成工具

```typescript
// shared/utils/navigation.ts

export interface MenuItem {
  name: string
  path: string
  children?: MenuItem[]
}

/**
 * 导航菜单生成器
 * 根据页面列表自动生成带有二级菜单的导航结构
 * 
 * @param pages - 页面列表 { name, path }
 * @returns 树形菜单结构
 */
export function generateNavigationMenu(pages: Array<{ name: string; path: string }>): MenuItem[] {
  const sorted = [...pages].sort((a, b) => a.path.split('/').length - b.path.split('/').length)
  
  const menuMap = new Map<string, MenuItem>()
  const topLevel: MenuItem[] = []

  for (const page of sorted) {
    const item: MenuItem = { name: page.name, path: page.path }
    menuMap.set(page.path, item)

    const parentPath = getParentPath(page.path)
    
    if (parentPath && menuMap.has(parentPath)) {
      const parent = menuMap.get(parentPath)!
      parent.children = parent.children || []
      parent.children.push(item)
    } else {
      topLevel.push(item)
    }
  }

  return topLevel
}

function getParentPath(path: string): string | null {
  const segments = path.split('/').filter(Boolean)
  if (segments.length <= 1) return null
  segments.pop()
  return '/' + segments.join('/')
}

/**
 * 验证页面路径是否有效
 */
export function validatePagePath(path: string, existingPaths: string[]): boolean {
  if (!path.startsWith('/')) return false
  if (existingPaths.includes(path)) return false
  
  // 检查父路径是否存在
  const parentPath = getParentPath(path)
  if (parentPath && !existingPaths.includes(parentPath)) {
    return false
  }
  
  return true
}
```

#### 5.2 SEO工具函数

```typescript
// shared/utils/seo.ts

export interface SEOConfig {
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
  ogTitle?: string
  ogDescription?: string
  canonical?: string
}

/**
 * SEO元数据生成器
 */
export function generateMetaTags(config: SEOConfig, defaults: SEOConfig = {}): Record<string, string> {
  const merged = { ...defaults, ...config }
  
  return {
    'title': merged.title || 'Untitled',
    'description': merged.description || '',
    'keywords': merged.keywords || '',
    'og:title': merged.ogTitle || merged.title || '',
    'og:description': merged.ogDescription || merged.description || '',
    'og:image': merged.ogImage || '',
    'canonical': merged.canonical || ''
  }
}

/**
 * 将SEO配置转换为HTML meta标签字符串
 */
export function seoConfigToHTML(config: SEOConfig): string {
  const tags: string[] = []
  
  if (config.title) {
    tags.push(`<title>${escapeHTML(config.title)}</title>`)
  }
  if (config.description) {
    tags.push(`<meta name="description" content="${escapeHTML(config.description)}">`)
  }
  if (config.keywords) {
    tags.push(`<meta name="keywords" content="${escapeHTML(config.keywords)}">`)
  }
  if (config.ogTitle) {
    tags.push(`<meta property="og:title" content="${escapeHTML(config.ogTitle)}">`)
  }
  if (config.ogImage) {
    tags.push(`<meta property="og:image" content="${escapeHTML(config.ogImage)}">`)
  }
  
  return tags.join('\n')
}

function escapeHTML(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
```

#### 5.3 Schema处理工具

```typescript
// shared/utils/schema.ts
import type { JSONSchema7 } from 'json-schema'

/**
 * JSON Schema 工具集
 */
export const SchemaUtils = {
  /**
   * 从Schema中提取默认值对象
   */
  extractDefaults(schema: JSONSchema7): Record<string, any> {
    const defaults: Record<string, any> = {}
    
    if (schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        if (typeof prop === 'object' && prop !== null && 'default' in prop) {
          defaults[key] = prop.default
        }
      }
    }
    
    return defaults
  },

  /**
   * 合并Schema（用于继承和覆盖场景）
   */
  mergeSchemas(base: JSONSchema7, override: JSONSchema7): JSONSchema7 {
    return {
      ...base,
      ...override,
      properties: {
        ...(base.properties || {}),
        ...(override.properties || {})
      }
    }
  },

  /**
   * 从HTML Handlebars模板中提取使用的变量
   */
  extractTemplateVariables(htmlCode: string): string[] {
    const regex = /\{\{([^}]+)\}\}/g
    const variables = new Set<string>()
    let match: RegExpExecArray | null
    
    while ((match = regex.exec(htmlCode)) !== null) {
      const variable = match[1].trim().split('.')[0]  // 取顶层变量名
      variables.add(variable)
    }
    
    return Array.from(variables)
  },

  /**
   * 验证props数据是否符合Schema
   */
  validateProps(schema: JSONSchema7, props: Record<string, any>): {
    valid: boolean
    errors: string[]
  } {
    const errors: string[] = []
    
    if (schema.required && Array.isArray(schema.required)) {
      for (const field of schema.required) {
        if (!(field in props) || props[field] === undefined || props[field] === '') {
          errors.push(`Field "${field}" is required`)
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
}
```
