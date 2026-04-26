### 可视化建站平台 - 产品需求文档 & 技术实现方案

| 版本 | 日期 | 作者 | 备注 |
| :--- | :--- | :--- | :--- |
| V1.0 | 2024-05-24 | AI 架构师 | 整合所有需求，并提出优化建议 |

---

### 目录

1.  **产品概述**
    1.1 项目背景与核心价值
    1.2 产品定位
    1.3 核心用户画像
2.  **功能需求详述**
    2.1 用户账户与授权 (Account & Auth)
    2.2 网站生命周期管理 (Site Management)
    2.3 页面与导航管理 (Page & Nav Management)
    2.4 可视化页面编辑器 (Page Builder)
    2.5 区块模板管理中心 (Block Template Center)
    2.6 模板市场与AI建站 (Marketplace & AI Builder)
    2.7 站点预览与发布 (Preview & Deploy)
    2.8 我的收藏与克隆 (Favorites & Cloning)
3.  **非功能性需求**
4.  **数据库设计**
    4.1 实体关系图(ER图)核心关系
    4.2 核心数据表结构 (Schema)
5.  **技术实现方案**
    5.1 技术栈总览
    5.2 前端架构设计 (Vue3)
    5.3 后端服务与API (Supabase)
    5.4 核心功能实现流程
6.  **优化与前瞻性建议**
7.  **开发路线图**

---

### 1. 产品概述

#### 1.1 项目背景与核心价值
本项目旨在打造一个集可视化建站、模板市场、AI辅助生成、一键部署于一体的现代Web建站平台。其核心思想是**组件化**与**完全解耦**，将网站解构为可复用的区块，并确保用户创建的实例与原始模板完全独立，提供极致的灵活性。平台通过集成GitHub生态，解决用户建站最后一公里的托管与发布问题。

#### 1.2 产品定位
面向开发者、设计师及初级用户的，**低代码、高扩展性、AI驱动**的静态网站构建与托管平台。

#### 1.3 核心用户画像
*   **普通用户**: 希望快速搭建个人博客、作品集或企业展示站，无需关心服务器运维。
*   **设计师**: 需要高度自由的画布来实现创意，并能将设计沉淀为模板。
*   **开发者**: 使用熟悉的Handlebars和Tailwind CSS语法，可以快速构建和复用自定义区块。

### 2. 功能需求详述

#### 2.1 用户账户与授权
*   **FR-01 唯一登录方式**: 平台仅支持 **GitHub OAuth** 登录。
*   **FR-02 数据持久化**: 用户首次登录成功后，系统必须自动执行以下操作：
    1.  在 `profiles` 表中创建或更新用户记录，保存 `github_id`、`username` 等唯一标识。
    2.  **不**在此步骤为用户创建任何GitHub仓库，仅记录用户信息。
*   **FR-03 权限控制**: 使用Supabase的Row Level Security (RLS) 确保所有用户数据隔离。

#### 2.2 网站生命周期管理
*   **FR-04 多网站支持**: 登录用户可以创建和管理多个网站。
*   **FR-05 创建网站**: 创建网站时需填写基础信息：网站名称、网站描述（用于SEO）。
*   **FR-06 网站级全局配置**:
    *   **SEO配置**: 为整个站点设置默认标题、描述、关键词、og:image等，每个站点下所有页面默认继承这些配置，但也可被页面级配置覆盖。
    *   **导航栏**: 配置是否显示、Logo、网站名称、CTA按钮（文本、链接）。
    *   **页脚**: 配置版权信息、社交链接等。
*   **FR-07 删除网站**: 支持删除网站及关联的所有页面、区块实例等数据（逻辑删除或物理删除+确认机制）。

#### 2.3 页面与导航管理
*   **FR-08 多页面支持**: 每个网站可创建多个页面。
*   **FR-09 页面属性**:
    *   页面名称、页面路径（如 `/about` 或 `/blog/my-first-post`）。
    *   **SEO配置**: 支持覆盖网站的全局SEO设置，提供更精细的页面标题、描述等字段。
*   **FR-10 导航菜单自动生成**:
    *   导航菜单基于该网站下的`页面名称`和`页面路径`自动生成，无需手动配置菜单项。
    *   **支持二级菜单**:
        *   路径分析规则：系统自动解析页面路径结构来构建层级。例如：
            *   一级菜单: `/about`
            *   二级菜单: `/about/contact`, `/about/team`
        *   父级路径 `/about` 对应的页面必须存在，系统才会在其下挂载以 `about/` 为前缀的二级页面。

#### 2.4 可视化页面编辑器 (核心)
*   **FR-11 三区布局**: 经典的“左侧物料库 - 中间画布 - 右侧属性面板”布局。
*   **FR-12 左侧 - 区块模板库**:
    *   **官方模板**: 展示管理员发布的内置区块模板。
    *   **我的收藏**: 展示当前用户收藏的区块模板，以独立标签或分区展示。
    *   **操作**: 用户通过**拖拽**模板到中间画布，以创建区块实例。
*   **FR-13 中间 - 可视化画布**:
    *   **实例创建**: 拖拽过程执行“拷贝”操作，将模板的 `html_code` 和 `schema` 复制一份，并创建一个新的 `block_instances` 记录。
    *   **实例独立**: 创建的实例与源模板**永久性解除关联**。任何对实例的修改都不会影响模板，管理员更新模板也不会影响已创建的实例。
    *   **操作**: 支持选中（高亮框）、拖拽排序、删除。
*   **FR-14 右侧 - 属性编辑区**:
    *   **动态表单**: 当选中一个区块实例时，读取其已存储的 `schema`，通过表单渲染引擎（如 `vue-json-schema-form`）自动生成配置表单。
    *   **内容与样式**: 用户修改表单，数据实时双向绑定，驱动画布中实例的样式和内容更新。
    *   **数据存储**: 用户修改后的属性值会更新到 `block_instances` 表的 `props_data` 字段中。

#### 2.5 区块模板管理中心 (管理员)
*   **FR-15 模板创建与编辑**:
    *   **代码编辑器**: 提供支持语法高亮的代码编辑器，用于编写 **TailwindCSS + Handlebars** 组合的HTML代码。
    *   **Schema编辑器**: 提供可视化的JSON Schema编辑器，用于定义区块的可配置属性（名称、类型、默认值等），该Schema将驱动右侧表单的生成和左侧的动态预览。
*   **FR-16 双向实时预览**:
    *   **左侧**: 管理员修改Schema或模板代码。
    *   **右侧**: 实时渲染区块效果。预览区使用Schema中定义的默认值，并作为一个可交互的表单，管理员可以直接修改表单值来验证区块的交互和样式变化。

#### 2.6 模板市场与AI建站
*   **FR-17 模板市场**: 一个公开的或平台内可见的模板展示区，分为：
    *   **区块模板**: 单个功能区块。
    *   **页面模板**: 由多个区块实例组成的完整页面布局。
    *   **整站模板**: 包含全局配置、多个页面、页面布局的完整网站包。
*   **FR-18 发布到市场**: 用户可以将自己的资产发布到模板市场。
    *   **操作入口**:
        *   在页面编辑器中，右键或通过按钮将某**区块实例**反向发布为**区块模板**。
        *   在网站设置中，将某个**页面**发布为**页面模板**。
        *   在网站列表，将整个**网站**发布为**整站模板**。
*   **FR-19 收藏与克隆**:
    *   **收藏**: 用户可以在市场中收藏喜欢的模板。
    *   **一键克隆(整站)**: 基于一个整站模板，快速创建一个完整的网站副本，包括其全部页面、区块实例和配置。
    *   **一键添加(页面)**: 在编辑网站时，选择一个页面模板，其包含的全部区块实例会被复制并添加到当前网站的指定页面中。
*   **FR-20 AI一键建站**:
    *   **输入**: 用户提供“网站名称”、“网站类型/简短描述”、“选择偏好的整站模板（可选）”。
    *   **过程**:
        1.  系统将用户描述和所选模板的Schema结构作为Prompt。
        2.  AI（如GPT模型）分析描述，并基于所选模板的Schema生成填充数据（`props_data`）。
        3.  系统后端（Supabase Edge Function）执行克隆操作：复制所选整站模板的结构，并用AI生成的`props_data`填充每一个区块实例。
    *   **结果**: 用户在极短时间内得到一个结构完整、内容贴切的初始网站，可立即进入编辑器进行微调和优化。**AI生成的网站与手动创建的网站在数据库结构和后续操作上无任何区别。**

#### 2.7 预览与发布
*   **FR-21 预览**:
    *   **整站预览**: 点击预览，在新标签页打开网站。此功能通过一个特殊路由实现，该路由加载全局配置和页面、区块数据，渲染生成完整HTML。
    *   **单页面预览**: 在编辑器中预览当前页面，实现上复用整站预览的路由，仅传递当前页面ID作为参数。
*   **FR-22 下载整站**: 一键打包下载包含所有HTML、CSS、JS、图片的完整静态网站ZIP包。
*   **FR-23 发布到GitHub Pages**:
    *   用户点击“发布”。
    *   系统调用GitHub API，在用户账户下创建名为 `site-{site_id}` 的仓库。
    *   将 `repo_id` 和 `repo_full_name` 保存到 `sites` 表。
    *   将生成的网站静态文件通过API推送到该仓库的 `gh-pages` 或 `main` 分支。
    *   获取并展示 `https://{username}.github.io/{repo-name}` 的默认域名。
*   **FR-24 绑定自定义域名**:
    *   用户在平台输入自有域名。
    *   平台调用GitHub API为该仓库的Pages设置自定义域名，并创建CNAME文件。
    *   平台提示用户到域名DNS服务商处添加CNAME记录，指向 `{username}.github.io`。

### 3. 非功能性需求

*   **性能**: 页面编辑器核心操作（拖拽、选中、属性修改）响应时间 < 50ms。整站静态生成时间 < 5s（对于10页面以内的站点）。
*   **安全**: 100%通过GitHub OAuth，不使用密码体系。所有API请求通过Supabase Auth和RLS鉴权。GitHub Token加密存储（使用Supabase Vault）。
*   **可扩展性**: 区块体系完全由Schema驱动，未来可无限扩展区块类型，无需修改编辑器核心代码。
*   **SEO友好**: 生成的静态HTML自带完善的、可配置的meta标签和语义化结构。

### 4. 数据库设计

#### 4.1 核心实体关系图(ERD)

```mermaid
erDiagram
    profiles ||--o{ sites : owns
    sites ||--o{ pages : has
    sites ||--o| site_globals : has
    pages ||--o{ block_instances : has
    block_templates ||--o{ block_instances : "used to create, then decoupled"
    
    profiles ||--o{ favorites : has
    favorites ||--o| block_templates : "fav type"
    favorites ||--o| page_templates : "fav type"
    favorites ||--o| site_templates : "fav type"

    sites ||--o| site_templates : "published as"
    pages ||--o| page_templates : "published as"
    block_instances ||--o| block_templates : "published as"

    profiles {
        uuid id PK
        string github_id UK
        string username
        jsonb metadata
        timestamp created_at
    }

    sites {
        uuid id PK
        uuid profile_id FK
        string name
        string description
        jsonb seo_config
        boolean published
        timestamp created_at
    }

    pages {
        uuid id PK
        uuid site_id FK
        string name
        string path
        int sort_order
        jsonb seo_config
        timestamp created_at
    }

    site_globals {
        uuid id PK
        uuid site_id FK "UNIQUE"
        jsonb nav_config
        jsonb footer_config
    }

    block_templates {
        uuid id PK
        uuid created_by FK
        string name
        string html_code
        jsonb schema
        string preview_image
        string category
        string origin "SYSTEM / USER"
        boolean is_published
        timestamp created_at
    }

    block_instances {
        uuid id PK
        uuid page_id FK
        uuid source_template_id FK "Nullable, for reference"
        string copied_html_code
        jsonb copied_schema
        jsonb props_data
        int sort_order
        timestamp created_at
    }

    page_templates {
        uuid id PK
        uuid created_by FK
        string name
        string preview_image
        jsonb instance_snapshot
        timestamp created_at
    }

    site_templates {
        uuid id PK
        uuid created_by FK
        string name
        string description
        string preview_image
        jsonb site_snapshot
        timestamp created_at
    }

    favorites {
        uuid id PK
        uuid profile_id FK
        string item_type "BLOCK / PAGE / SITE"
        uuid item_id
        timestamp created_at
        UNIQUE(profile_id, item_type, item_id)
    }
```

#### 4.2 核心数据表结构说明

*   **`site_globals`**: 存储网站级别的导航栏和页脚配置。
    *   `nav_config`: `{ "logo": "url", "site_name": "My Site", "cta_button": { "text": "Hire Me", "link": "/contact" } }`
    *   `footer_config`: `{ "copyright": "© 2024", "links": [{ "text": "Twitter", "url": "..." }] }`
*   **`pages`**: `path` 字段存储如 `/about/contact`，二级菜单解析逻辑基于此。`seo_config` 覆盖全局配置。
*   **`block_instances`**: **关键设计**。`copied_html_code` 和 `copied_schema` 在创建时从模板复制，**保证完全解耦**。`props_data` 存储用户通过属性面板编辑后的数据。渲染时将 `props_data` 注入 `copied_html_code`。
*   **`*_templates`**: 本质是快照表。
    *   `page_templates.instance_snapshot`: 存储一个JSON，包含了创建该页面时所有 `block_instances` 的完整数据（`copied_html_code`, `copied_schema`, `props_data`, `sort_order`）。
    *   `site_templates.site_snapshot`: 存储一个更复杂的JSON，包含了 `site_globals`, 所有 `pages`, 以及页面下所有 `block_instances` 的完整快照数据。
*   **`favorites`**: 多态关联表，通过 `item_type` 区分收藏类型。

### 5. 技术实现方案

#### 5.1 技术栈总览
*   **前端**: Vue 3 (Composition API), Vite, Pinia, Vue Router, TailwindCSS, Headless UI
*   **表单引擎**: `vue-json-schema-form`
*   **模板引擎**: Handlebars (前端运行时 `handlebars/dist/handlebars.runtime.js`)
*   **后端/服务**: **Supabase**
    *   Auth: GitHub OAuth 集成
    *   Database: PostgreSQL (数据存储, JSON Schema校验)
    *   Storage: 用户上传的图片等静态资源
    *   Edge Functions (Deno): 核心后端逻辑 (GitHub交互, AI通信, 静态站点生成)
    *   RLS (Row Level Security): 数据安全保障
    *   Vault: GitHub Token安全存储
*   **AI服务**: OpenAI API (或类似LLM服务)
*   **部署**: Vercel / Netlify (前端), Supabase Cloud

#### 5.2 前端架构设计
*   **状态管理 (Pinia)**:
    *   `useAuthStore`: 管理用户登录态、Supabase Session。
    *   `useEditorStore`: **核心store**，管理当前编辑的网站、页面、区块实例列表、选中状态、拖拽状态。所有画布和属性面板的交互都通过此store进行。
    *   `useMarketplaceStore`: 管理模板市场数据、收藏列表。
*   **路由设计**:
    *   `/`: 仪表盘/网站列表
    *   `/site/:siteId/dashboard`: 网站仪表盘、页面管理
    *   `/site/:siteId/editor/:pageId`: 页面编辑器
    *   `/admin/templates`: 区块模板管理中心
    *   `/marketplace`: 模板市场
    *   `/preview/:siteId` 和 `/preview/:siteId/:pageId`: 预览路由
*   **核心组件设计**:
    *   `EditorCanvas.vue`: 处理拖拽放置，渲染并管理 `BlockInstanceRenderer` 组件。
    *   `BlockInstanceRenderer.vue`: **动态渲染引擎**。接收 `copied_html_code` 和 `props_data`，在运行时用Handlebars编译并渲染出带作用域样式的HTML。
    *   `PropsEditorPanel.vue`: 动态表单容器，根据选中实例的 `copied_schema` 渲染 `JsonSchemaForm`。
    *   `DraggableBlockItem.vue`: 左侧物料库的可拖拽项。

#### 5.3 后端服务与API (Supabase Edge Functions)
*   **`render-site` Function**:
    *   **输入**: `siteId` / `pageId`（用于预览）
    *   **逻辑**: 从DB查询站点全局配置、页面、区块实例。在服务端将Handlebars数据和HTML片段进行最终拼接，生成完整的静态HTML字符串。
    *   **输出**: 完整的HTML文件流。
*   **`publish-to-github` Function**:
    *   **逻辑**:
        1.  从DB获取用户GitHub Token（通过Vault）。
        2.  调用 `render-site` 获取所有页面的静态HTML。
        3.  调用GitHub API: `POST /user/repos` 创建 `site-{siteId}` 仓库。
        4.  调用GitHub API: `PUT /repos/{owner}/{repo}/contents/...` 批量上传文件。
        5.  更新 `sites` 表 `repo_id` 字段。
        6.  如果配置了自定义域名，创建CNAME文件并上传。
*   **`ai-generate-site` Function**:
    *   **输入**: `site_name`, `user_desc`, `site_template_id` (可选)。
    *   **逻辑**:
        1.  获取模板的 `site_snapshot`。
        2.  遍历snapshot中每个 `block_instance`，提取其 `copied_schema` 和当前 `props_data` 作为上下文。
        3.  构建Prompt，调用OpenAI API，要求AI为每个实例生成新的、符合用户描述的 `props_data`。
        4.  将AI返回的数据与模板快照结构组合，创建新的 `sites`, `pages`, `block_instances` 记录。
    *   **输出**: 一个新网站的ID。

#### 5.4 核心功能实现要点
*   **区块模板与实例解耦**:
    *   拖拽发生时，不存储模板ID作为强关联。而是执行：
        `INSERT INTO block_instances (page_id, source_template_id, copied_html_code, copied_schema) VALUES (...)`
    *   之后所有的查询、更新操作，只针对 `block_instances` 表。
*   **Handlebars在编辑器的实时渲染**:
    *   在 `BlockInstanceRenderer` 中，使用 `watchEffect` 监听 `props_data` 的变化。一旦变化，立即调用 `Handlebars.compile(copied_html_code)(props_data)` 生成新的HTML，并通过 `v-html` 更新。
    *   Tailwind CSS类的样式通过全局引入或在Shadow DOM中（如果追求完美样式隔离）来保证生效。建议在预览和发布时才进行完整的CSS分离与生成。

### 6. 优化与前瞻性建议

1.  **版本控制与回滚**:
    *   **建议**: 为 `block_instances` 和 `sites` 增加版本控制。
    *   **实现**: 可新增 `instance_versions` 表，或在关键字段使用 `jsonb` 存储变更历史。用户可在编辑器中“撤销/重做”或回到上N个发布版本。
2.  **AI辅助优化**:
    *   **AI内容填充**: 在属性面板中，为文本类字段增加“AI生成”按钮，可针对该区块的上下文（Schema + 当前Props）进行微调。
    *   **AI样式建议**: 用户选中区块，可要求AI根据整个页面的设计风格，调整该区块的Tailwind CSS类名以更好地融合。
3.  **协同编辑**: 使用Supabase的Realtime功能，可初步实现多人同时在线编辑网站的功能。通过监听 `block_instances` 表的INSERT/UPDATE/DELETE事件，并在客户端做冲突合并。
4.  **多语言支持**: `props_data` 结构原生支持多语言。可以设计一个 `locale` 字段，在渲染时根据当前语言读取不同的值。
5.  **性能优化**: 当网站页面和区块数量巨大时，整站静态生成过程可能会变慢。可将“发布”和“渲染”解耦，引入消息队列（如Supabase的 `pgmq` 扩展）来异步处理GitHub文件上传，并通过WebSocket通知用户发布进度。

### 7. 开发路线图

*   **Phase 1 (MVP)**: 用户GitHub登录、创建网站/页面、基础三栏编辑器（拖拽、schema动态表单）、核心解耦逻辑、基础预览。
*   **Phase 2 (发布与生态)**: GitHub Pages发布/自定义域名绑定、下载整站、站点级导航/页脚配置、二级导航菜单。
*   **Phase 3 (市场与增长)**: 区块/页面/整站模板市场、发布到市场、收藏功能、一键克隆。
*   **Phase 4 (AI与智能)**: AI一键建站、AI内容/样式微调、模板推荐。
*   **Phase 5 (企业级)**: 版本控制与回滚、协同编辑初版、多语言支持。
