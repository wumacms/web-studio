import { Octokit } from '@octokit/rest'
import { siteApi } from '@/api/endpoints/site.api'
import { blockApi } from '@/api/endpoints/block.api'
import { siteGlobalsApi } from '@/api/endpoints/site-globals.api'
import Handlebars from 'handlebars'

export const slugify = (_text: string) => {
  // Generate a random 8-character alphanumeric string
  const randomStr = Math.random().toString(36).substring(2, 10)
  return `web-studio-${randomStr}`
}

export type DeployStep = 'creating-repo' | 'pushing-files' | 'enabling-pages'

export const githubPagesService = {
  async deploy(siteId: string, token: string, repoName: string, onStep?: (step: DeployStep) => void) {
    console.log('Starting deployment for repo:', repoName)
    const octokit = new Octokit({ auth: token })
    
    // 1. Create or get repo
    if (onStep) onStep('creating-repo')
    const { repo, owner } = await this.createRepo(token, repoName)
    console.log('Repo ready:', repo.html_url)

    // 3. Generate static files
    console.log('Generating files...')
    const files = await this.generateFiles(siteId)

    // 4. Push all files in a single commit
    if (onStep) onStep('pushing-files')
    try {
      console.log('Pushing files...')
      await this.pushFiles(octokit, owner, repoName, files)
      console.log('Files pushed successfully')
    } catch (e: any) {
      console.error('Failed to push files:', e)
      throw new Error(`Failed to upload files: ${e.message}`)
    }

    // 5. Enable GitHub Pages
    if (onStep) onStep('enabling-pages')
    try {
      console.log('Enabling GitHub Pages...')
      await octokit.repos.createPagesSite({
        owner,
        repo: repoName,
        source: { branch: 'main', path: '/' }
      })
      console.log('GitHub Pages enabled')
    } catch (e: any) {
      // 409 means it's already enabled, which is fine
      if (e.status !== 409) {
        console.warn('Non-critical error enabling GitHub Pages:', e)
      }
    }

    const pagesUrl = `https://${owner}.github.io/${repoName}/`
    const repoUrl = repo.html_url

    // 6. Save to Supabase
    try {
      console.log('Updating site info in database...')
      await siteApi.updateSite(siteId, {
        repo_name: repoName,
        repo_url: repoUrl,
        pages_url: pagesUrl,
        repo_id: repo.id.toString(),
        repo_full_name: repo.full_name,
        published: true
      })
      console.log('Database updated')
    } catch (e: any) {
      console.error('Failed to update site in database:', e)
      // We don't throw here because the deployment actually succeeded
    }

    return {
      repoUrl,
      pagesUrl
    }
  },

  async createRepo(token: string, repoName: string) {
    const octokit = new Octokit({ auth: token })
    
    // 1. Get user info
    let owner: string
    try {
      const { data: user } = await octokit.users.getAuthenticated()
      owner = user.login
    } catch (e: any) {
      throw new Error('GitHub authentication failed. Please check your token.')
    }

    // 2. Create or get repo
    let repo: any
    try {
      const { data } = await octokit.repos.get({ owner, repo: repoName })
      repo = data
    } catch (e: any) {
      if (e.status === 404) {
        try {
          const { data } = await octokit.repos.createForAuthenticatedUser({
            name: repoName,
            description: 'Created with Web Studio AI',
            auto_init: true
          })
          repo = data
          // Wait a bit for GitHub to initialize the repo
          await new Promise(resolve => setTimeout(resolve, 2000))
        } catch (createErr: any) {
          throw new Error(`Failed to create repository: ${createErr.message}`)
        }
      } else {
        throw e
      }
    }

    return { repo, owner }
  },

  async deleteRepo(token: string, repoIdOrName: string) {
    const octokit = new Octokit({ auth: token })
    try {
      let owner: string
      let repoName: string

      // Check if the input is a numeric ID (as a string)
      const isId = /^\d+$/.test(repoIdOrName)

      if (isId) {
        console.log(`Fetching repo details for ID: ${repoIdOrName}`)
        const { data: repo } = await octokit.request('GET /repositories/{id}', {
          id: repoIdOrName
        })
        owner = repo.owner.login
        repoName = repo.name
      } else {
        // Fallback: Assume it's a repo name and get current user as owner
        console.log(`Using repo name fallback: ${repoIdOrName}`)
        const { data: user } = await octokit.users.getAuthenticated()
        owner = user.login
        repoName = repoIdOrName
      }
      
      console.log(`Deleting repo: ${owner}/${repoName}`)
      await octokit.repos.delete({
        owner,
        repo: repoName
      })
      console.log(`Successfully deleted GitHub repo: ${owner}/${repoName}`)
    } catch (e: any) {
      console.error('Failed to delete GitHub repo:', e)
      
      // Handle specific 403 error for missing 'delete_repo' scope
      if (e.status === 403) {
        throw new Error('Your GitHub token lacks the "delete_repo" scope. Please enable it in your GitHub Personal Access Token settings.')
      }

      // If it's already deleted (404), we consider it a success
      if (e.status !== 404) {
        throw new Error(`Failed to delete GitHub repository: ${e.message}`)
      }
    }
  },

  async generateFiles(siteId: string) {
    const files: { path: string, content: string }[] = []
    
    // Logic similar to exportService but returns individual files
    const { data: site_data } = await siteApi.getSite(siteId)
    const site_name = site_data.name
    const pages = await siteApi.getPages(siteId)
    const globals = await siteGlobalsApi.getGlobals(siteId)
    const i18n = globals?.i18n_config || { primary: 'en', enabled: ['en'] }

    const baseTemplate = (content: string, title: string, currentLang: string) => `
<!DOCTYPE html>
<html lang="${currentLang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white text-gray-900 flex flex-col min-h-screen">
    ${this.renderNav(globals, pages, site_name, currentLang, i18n)}
    <main class="flex-1">${content}</main>
    ${this.renderFooter(globals, site_name)}
</body>
</html>`

    for (const lang of i18n.enabled) {
      const isPrimary = lang === i18n.primary
      const prefix = isPrimary ? '' : `${lang}/`

      for (const page of pages) {
        const blocks = await blockApi.getPageBlocks(page.id)
        let pageContent = ''
        
        for (const block of blocks) {
          const template = Handlebars.compile(block.copied_html_code)
          const displayProps = (lang !== i18n.primary && block.translations?.[lang]) 
            ? block.translations[lang] 
            : block.props_data
          pageContent += template(displayProps)
        }
        
        const fullHtml = baseTemplate(pageContent, page.name, lang)
        const fileName = page.path === '/' ? 'index.html' : `${page.path.replace('/', '')}.html`
        files.push({
          path: `${prefix}${fileName}`,
          content: fullHtml
        })
      }
    }

    // Add a .nojekyll file to prevent Jekyll from processing files (important for Tailwind/CSS)
    files.push({ path: '.nojekyll', content: '' })

    return files
  },

  renderNav(globals: any, pages: any[], fallbackName: string, currentLang: string, i18n: any): string {
    if (!globals?.nav_config) return ''
    const nav = globals.nav_config
    const isPrimary = currentLang === i18n.primary

    const links = pages.map(p => {
      const name = p.path === '/' ? 'index.html' : p.path.replace('/', '') + '.html'
      const href = isPrimary ? name : `../${name}`
      return `<a href="${href}" class="hover:text-blue-600 transition-colors">${p.name}</a>`
    }).join('')

    return `
    <nav class="py-4 px-8 border-b border-gray-100 bg-white sticky top-0 z-40">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3">
          ${nav.logo ? `<img src="${nav.logo}" class="h-8 w-auto" />` : ''}
          <span class="font-bold text-xl">${nav.site_name || fallbackName}</span>
        </div>
        <div class="flex items-center gap-8 text-sm font-medium">
          <div class="hidden md:flex items-center gap-6">${links}</div>
          ${nav.cta_button?.text ? `<a href="${nav.cta_button.link}" class="px-5 py-2 bg-blue-600 text-white rounded-full font-bold text-sm transition-all hover:bg-blue-700">${nav.cta_button.text}</a>` : ''}
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
  },

  async pushFiles(octokit: Octokit, owner: string, repo: string, files: { path: string, content: string }[]) {
    const branch = 'main'
    console.log(`Pushing ${files.length} files to ${owner}/${repo} on branch ${branch}`)
    
    // 1. Get the SHA of the latest commit on the branch
    console.log('Getting latest commit SHA...')
    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`
    })
    const latestCommitSha = refData.object.sha
    console.log('Latest commit SHA:', latestCommitSha)

    // 2. Get the tree SHA of the latest commit
    console.log('Getting base tree SHA...')
    const { data: commitData } = await octokit.git.getCommit({
      owner,
      repo,
      commit_sha: latestCommitSha
    })
    const baseTreeSha = commitData.tree.sha
    console.log('Base tree SHA:', baseTreeSha)

    // 3. Create a new tree with the files
    console.log('Creating new tree...')
    const tree = files.map(file => ({
      path: file.path,
      mode: '100644' as const,
      type: 'blob' as const,
      content: file.content
    }))

    const { data: newTreeData } = await octokit.git.createTree({
      owner,
      repo,
      base_tree: baseTreeSha,
      tree
    })
    console.log('New tree created:', newTreeData.sha)

    // 4. Create a new commit
    console.log('Creating new commit...')
    const { data: newCommitData } = await octokit.git.createCommit({
      owner,
      repo,
      message: `Deploy from Web Studio: ${files.length} files`,
      tree: newTreeData.sha,
      parents: [latestCommitSha]
    })
    console.log('New commit created:', newCommitData.sha)

    // 5. Update the reference
    console.log('Updating ref...')
    await octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: newCommitData.sha
    })
    console.log('Ref updated successfully')
  }
}
