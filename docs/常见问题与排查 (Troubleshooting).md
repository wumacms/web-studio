# 常见问题与排查 (Troubleshooting)

本文档记录了在项目开发和部署过程中遇到的常见问题及其解决方案。

## 1. GitHub 登录成功后跳转到 localhost:3000

### 问题描述
在生产环境（GitHub Pages）点击 GitHub 登录，授权成功后，页面自动跳转到了 `http://localhost:3000/#access_token=...`，而不是返回生产环境地址。

### 原因分析
Supabase Auth 的安全机制规定，如果 `signInWithOAuth` 传入的 `redirectTo` 地址不在允许列表中，或者未正确配置 **Site URL**，系统将默认回退到控制台中设置的主站点地址。

### 解决方案
1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)。
2. 进入 **Authentication > URL Configuration**。
3. **Site URL**: 修改为生产环境地址，例如 `https://wumacms.github.io/web-studio/`。
4. **Redirect URLs**: 添加以下地址以支持多环境跳转：
   - `https://wumacms.github.io/web-studio/**` (生产环境)
   - `http://localhost:3000/**` (本地开发)

---

## 2. 预览页面在 GitHub Pages 上报 404 错误

### 问题描述
点击“预览站点”或“预览页面”按钮时，浏览器跳转到了 `https://wumacms.github.io/preview/...`，导致 GitHub 返回 404 错误。

### 原因分析
由于 GitHub Pages 托管在二级目录下（`/web-studio/`），直接使用以 `/` 开头的绝对路径（如 `window.open('/preview/...')`）会使浏览器跳转到域名的根目录，从而丢失了项目路径。

### 解决方案
在代码中使用 Vite 提供的 `import.meta.env.BASE_URL` 动态拼接路径。

**修改前：**
```typescript
window.open(`/preview/${siteId}`, '_blank')
```

**修改后：**
```typescript
window.open(`${import.meta.env.BASE_URL}preview/${siteId}`, '_blank')
```

> [!TIP]
> `BASE_URL` 的值在 `vite.config.ts` 中配置。本地开发时为 `/`，生产环境构建时为 `/web-studio/`。

---

## 3. 刷新页面出现 GitHub 404 错误

### 问题描述
在使用 `createWebHistory` 模式时，手动刷新子路径（如 `/site/123/dashboard`）会看到 GitHub 的 404 页面。

### 原因分析
GitHub Pages 是静态文件托管，不支持单页应用（SPA）的路径重定向。当刷新页面时，服务器会尝试在对应目录下寻找 `index.html`，但由于该路径是前端路由，物理文件并不存在。

### 解决方案
项目已采用 `404.html` 重定向方案：
1. `public/404.html`: 捕获 404 错误，将当前路径编码后存入 URL 参数并重定向回 `index.html`。
2. `index.html`: 在入口处检测 URL 参数，还原路由状态。

如果此方案仍不稳定，可考虑在 `src/router/index.ts` 中切换为 `createWebHashHistory()`。
