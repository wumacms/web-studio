import { supabase } from '@/api/supabase/client'
import type { Site, Page } from '@/types/models/site'

export const siteApi = {
  async getSites(): Promise<Site[]> {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getSite(id: string): Promise<{ data: Site }> {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return { data }
  },

  async createSite(site: Partial<Site>): Promise<Site> {
    const { data, error } = await supabase
      .from('sites')
      .insert(site)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateSite(id: string, updates: Partial<Site>): Promise<Site> {
    const { data, error } = await supabase
      .from('sites')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteSite(id: string): Promise<void> {
    const { error } = await supabase
      .from('sites')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async getPages(siteId: string): Promise<Page[]> {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('site_id', siteId)
      .order('sort_order', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  async createPage(page: Partial<Page>): Promise<Page> {
    const { data, error } = await supabase
      .from('pages')
      .insert(page)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updatePage(id: string, updates: Partial<Page>): Promise<Page> {
    const { data, error } = await supabase
      .from('pages')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}
