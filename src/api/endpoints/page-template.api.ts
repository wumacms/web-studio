import { supabase } from '@/api/supabase/client'

export interface PageTemplate {
  id: string
  name: string
  description?: string
  preview_image?: string
  category?: string
  blocks: any[]
  is_published?: boolean
  created_by?: string
  created_at?: string
}

export const pageTemplateApi = {
  async getPageTemplates(): Promise<PageTemplate[]> {
    const { data, error } = await supabase
      .from('page_templates')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async createPageTemplate(template: Partial<PageTemplate>): Promise<PageTemplate> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('page_templates')
      .insert({
        ...template,
        created_by: user.id
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async addPageToSite(templateId: string, siteId: string, name: string, path: string): Promise<string> {
    // 1. Get Template
    const { data: template, error: tplError } = await supabase
      .from('page_templates')
      .select('*')
      .eq('id', templateId)
      .single()
    
    if (tplError) throw tplError

    // 2. Create Page
    const { data: page, error: pageError } = await supabase
      .from('pages')
      .insert({
        site_id: siteId,
        name,
        path,
        sort_order: 0
      })
      .select()
      .single()
    
    if (pageError) throw pageError

    // 3. Create Block Instances
    if (template.blocks && template.blocks.length > 0) {
      const { error: blockError } = await supabase.from('block_instances').insert(
        template.blocks.map((b: any, index: number) => ({
          ...b,
          page_id: page.id,
          sort_order: index
        }))
      )
      if (blockError) throw blockError
    }

    return page.id
  }
}
