import JSZip from 'jszip'
import Handlebars from 'handlebars'
import { blockApi } from '@/api/endpoints/block.api'
import { siteApi } from '@/api/endpoints/site.api'
import { siteGlobalsApi } from '@/api/endpoints/site-globals.api'
import type { BlockInstance } from '@/types/models/block'

export const exportService = {
  async exportToZip(siteId: string): Promise<Blob> {
    const zip = new JSZip()
    
    // 1. Fetch all data
    const { data: site } = await siteApi.getSite(siteId)
    const pages = await siteApi.getPages(siteId)
    const globals = await siteGlobalsApi.getGlobals(siteId)
    const i18n = globals?.i18n_config || { primary: 'en', enabled: ['en'] }
    
    // 2. Base HTML Template
    const baseTemplate = (content: string, title: string, currentLang: string) => `
<!DOCTYPE html>
<html lang="${currentLang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { font-family: sans-serif; }
    </style>
</head>
<body class="bg-white text-gray-900 flex flex-col min-h-screen">
    ${this.renderNav(globals, pages, site.name, currentLang, i18n)}
    <main class="flex-1">${content}</main>
    ${this.renderFooter(globals, site.name)}
</body>
</html>`

    // 3. Generate for each enabled language
    for (const lang of i18n.enabled) {
      const isPrimary = lang === i18n.primary
      const folder = isPrimary ? zip : zip.folder(lang)!

      for (const page of pages) {
        const blocks = await blockApi.getPageBlocks(page.id)
        let pageContent = ''
        
        for (const block of blocks) {
          pageContent += this.renderBlock(block, lang, i18n.primary)
        }
        
        const fullHtml = baseTemplate(pageContent, page.name, lang)
        const fileName = page.path === '/' ? 'index.html' : `${page.path.replace('/', '')}.html`
        folder.file(fileName, fullHtml)
      }
    }

    return await zip.generateAsync({ type: 'blob' })
  },

  renderBlock(block: BlockInstance, lang: string, primaryLang: string): string {
    try {
      const template = Handlebars.compile(block.copied_html_code)
      const displayProps = (lang !== primaryLang && block.translations?.[lang]) 
        ? block.translations[lang] 
        : block.props_data
      return template(displayProps)
    } catch (e) {
      return ''
    }
  },

  renderNav(globals: any, pages: any[], fallbackName: string, currentLang: string, i18n: any): string {
    if (!globals?.nav_config) return ''
    const nav = globals.nav_config
    
    const isPrimary = currentLang === i18n.primary

    const links = pages.map(p => {
      const name = p.path === '/' ? 'index.html' : p.path.replace('/', '') + '.html'
      const href = isPrimary ? name : `${name}`
      return `<a href="${href}" class="hover:text-blue-600">${p.name}</a>`
    }).join('')

    const langSwitcher = i18n.enabled.length > 1 ? `
      <div class="flex items-center gap-2 border-l pl-4 ml-4 text-[10px] font-bold uppercase">
        ${i18n.enabled.map((l: string) => `
          <a href="${l === i18n.primary ? (isPrimary ? '#' : '../') : (isPrimary ? (l + '/') : './')}" class="${l === currentLang ? 'text-blue-600' : 'text-gray-400'}">${l}</a>
        `).join('')}
      </div>
    ` : ''

    return `
    <nav class="py-4 px-8 border-b border-gray-100 bg-white sticky top-0 z-40">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3">
          ${nav.logo ? `<img src="${nav.logo}" class="h-8 w-auto" />` : ''}
          <span class="font-bold text-xl">${nav.site_name || fallbackName}</span>
        </div>
        <div class="flex items-center gap-8 text-sm font-medium">
          <div class="hidden md:flex items-center gap-6">${links}</div>
          ${langSwitcher}
          ${nav.cta_button?.text ? `<a href="${nav.cta_button.link}" class="px-5 py-2 bg-blue-600 text-white rounded-full">${nav.cta_button.text}</a>` : ''}
        </div>
      </div>
    </nav>`
  },

  renderFooter(globals: any, fallbackName: string): string {
    if (!globals?.footer_config) return ''
    const footer = globals.footer_config
    return `
    <footer class="py-12 px-8 border-t border-gray-100 bg-gray-50 text-center">
      <div class="mb-4 font-bold opacity-50">${globals.nav_config?.site_name || fallbackName}</div>
      <p class="text-sm text-gray-500">${footer.copyright}</p>
    </footer>`
  }
}
