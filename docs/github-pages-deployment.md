# GitHub Pages 部署指南

本文档详细说明了如何将本 Web Studio 项目部署到 GitHub Pages。

## 1. 已完成的配置修改

为了适配 GitHub Pages 的静态托管环境，项目已完成以下关键修改：

### A. Vite 基础路径 (Base Path)
由于 GitHub Pages 通常托管在二级目录下（例如 `https://username.github.io/web-studio/`），我们在 `vite.config.ts` 中配置了动态 `base`：

```typescript
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/web-studio/' : '/',
  // ...
}))
```

### B. 路由模式切换 (History -> Hash)
GitHub Pages 不支持单页应用（SPA）的 HTML5 History 模式（刷新页面会报 404）。我们已在 `src/router/index.ts` 中切换为 **Hash 模式**：

```typescript
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  // ...
})
```

---

## 2. 自动化部署 (GitHub Actions)

项目包含了一个自动化部署脚本：`.github/workflows/deploy.yml`。每当你向 `main` 分支推送代码时，它会自动完成：
1. 安装依赖 (pnpm)
2. 注入环境变量 (Supabase Keys)
3. 构建项目 (`npm run build`)
4. 部署 `dist` 目录到 `gh-pages` 分支

---

## 3. 部署前必备设置 (需在 GitHub 完成)

在推送代码前，请确保在 GitHub 仓库中完成以下设置：

### 第一步：配置环境变量 (Secrets)
前往仓库的 **Settings > Secrets and variables > Actions**，点击 **New repository secret**，添加以下两个变量：
*   `VITE_SUPABASE_URL`: 你的 Supabase 项目 URL。
*   `VITE_SUPABASE_ANON_KEY`: 你的 Supabase Anon Key。

### 第二步：开启 Pages 功能
1. 前往 **Settings > Pages**。
2. 在 **Build and deployment > Source** 下，将 "Deploy from a branch" 改为 **"GitHub Actions"**。

---

## 4. Supabase 相关配置 (可选)

如果你在项目中使用了 Supabase Auth 认证功能：
1. 前往 **Supabase Dashboard > Authentication > URL Configuration**。
2. 在 **Redirect URLs** 中添加你的 GitHub Pages 地址（例如 `https://your-user.github.io/web-studio/`）。

---

## 5. 部署后的访问地址

部署完成后，你的项目地址通常为：
`https://<你的GitHub用户名>.github.io/web-studio/`

> **注意**：首次运行 Actions 可能需要 1-2 分钟完成部署。你可以在仓库的 **Actions** 标签页查看部署进度。
