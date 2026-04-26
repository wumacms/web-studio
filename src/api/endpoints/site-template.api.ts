import { supabase } from '@/api/supabase/client'

export interface SiteTemplate {
  id: string
  name: string
  description: string
  preview_image: string
  category: string
  is_published: boolean
  nav_config?: any
  footer_config?: any
  i18n_config?: any
  pages: Array<{
    name: string
    path: string
    blocks: Array<any>
  }>

}


export const siteTemplateApi = {
  async getSiteTemplates(): Promise<SiteTemplate[]> {
    const { data, error } = await supabase
      .from('site_templates')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async createSiteFromTemplate(templateId: string, siteName: string, contentOverride?: Record<string, any>): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // 1. Get Template Details
    const { data: template, error: tplError } = await supabase
      .from('site_templates')
      .select('*')
      .eq('id', templateId)
      .single()
    
    if (tplError) throw tplError

    // 2. Create Site
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .insert({
        name: siteName,
        profile_id: user.id,
        published: false
      })
      .select()
      .single()
    
    if (siteError) throw siteError

    // 3. Create Pages and Blocks
    for (let i = 0; i < template.pages.length; i++) {
      const p = template.pages[i]
      const { data: page, error: pageError } = await supabase
        .from('pages')
        .insert({
          site_id: site.id,
          name: p.name,
          path: p.path,
          sort_order: i
        })
        .select()
        .single()
      
      if (pageError) throw pageError

      if (p.blocks && p.blocks.length > 0) {
        const blockInserts = p.blocks.map((b: any, index: number) => {
          let propsData = { ...b.props_data }
          
          // Apply AI Overrides if available
          if (contentOverride && b.source_template_id && contentOverride[b.source_template_id]) {
            propsData = { ...propsData, ...contentOverride[b.source_template_id] }
          }

          return {
            ...b,
            id: crypto.randomUUID(),
            page_id: page.id,
            sort_order: index,
            props_data: propsData
          }
        })

        const { error: blocksError } = await supabase.from('block_instances').insert(blockInserts)
        if (blocksError) {
          console.error('Failed to insert blocks for page:', p.name, blocksError)
          throw blocksError
        }
      }
    }

    // 4. Create Globals
    await supabase.from('site_globals').insert({
      site_id: site.id,
      nav_config: template.nav_config,
      footer_config: template.footer_config,
      i18n_config: template.i18n_config
    })

    return site.id
  },

  async createSiteTemplate(template: Partial<SiteTemplate>): Promise<SiteTemplate> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('site_templates')
      .insert({
        ...template,
        created_by: user.id
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}


