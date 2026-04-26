# Web Studio Project Overview

本项目是一个基于 **Vue 3 + Supabase** 的现代化可视化建站平台。它允许用户通过拖拽区块、AI 生成内容以及模板克隆，快速构建并发布响应式网站到 GitHub Pages。

## 🚀 技术栈

- **前端框架**: Vue 3 (Composition API)
- **状态管理**: Pinia
- **路由管理**: Vue Router (History Mode)
- **样式处理**: TailwindCSS
- **图标库**: Lucide Vue Next
- **后端服务**: Supabase (Auth, PostgreSQL, Edge Functions)
- **模板引擎**: Handlebars (用于区块渲染)
- **构建工具**: Vite
- **持续集成**: GitHub Actions (自动部署)

## ✨ 核心功能

1.  **可视化编辑器**: 
    - 采用“区块（Block）”模式，支持从左侧库拖拽到画布。
    - 区块实例与其模板完全解耦，支持独立存储 HTML 和 Schema 数据。
    - 右侧属性面板基于 JSON Schema 自动生成可视化配置表单。
2.  **AI Magic Builder**:
    - 基于用户描述，通过 AI 自动填充网站内容（标题、文本、图片等）。
    - 保持模板结构的同时，智能匹配文案。
3.  **模板市场**:
    - 支持区块模板、页面模板和整站模板。
    - 用户可以发布自己的设计到市场，或从市场克隆优秀设计。
4.  **多语言 (i18n)**:
    - 系统级支持多语言切换和内容翻译。
5.  **GitHub 集成与部署**:
    - 通过 GitHub OAuth 登录。
    - 一键创建 GitHub 仓库并自动部署到 GitHub Pages。
    - 支持绑定自定义域名。

## 📂 项目结构

```text
src/
├── api/              # Supabase 客户端及各模块 API 定义
├── assets/           # 静态资源
├── modules/          # 功能模块
│   ├── auth/         # 认证模块（GitHub OAuth）
│   ├── marketplace/  # 模板市场
│   ├── page-editor/  # 核心编辑器
│   ├── site-builder/ # 网站管理与仪表盘
│   └── deployment/   # 部署与发布
├── shared/           # 公共组件与服务
├── types/            # TypeScript 类型定义
└── router/           # 路由配置
```

## 💡 核心概念

- **网站 (Site)**: 包含导航、页脚、全局配置及多个页面。
- **页面 (Page)**: 网站的内容单元，由多个区块实例组成。
- **区块模板 (Block Template)**: 预定义的 HTML 代码和属性 Schema。
- **区块实例 (Block Instance)**: 页面中具体的区块，拥有独立的内容数据。

## 📖 相关文档

- [GitHub Pages 部署指南](./github-pages-deployment.md) - *必读：生产环境配置步骤*
- [常见问题排查 (Troubleshooting)](./troubleshooting.md) - *解决 404 和跳转问题*
- [需求文档 1 (PRD v1)](./PRD_01.md)
- [需求文档 2 (PRD v2)](./PRD_02.md)

---

## 🛠️ 本地开发

1. 克隆项目
2. 安装依赖: `pnpm install`
3. 配置 `.env`: 填写 Supabase URL 和 Anon Key
4. 启动项目: `npm run dev`
