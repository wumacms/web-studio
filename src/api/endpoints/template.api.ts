import { supabase } from '@/api/supabase/client'
import type { BlockTemplate } from '@/types/models/block'

export const templateApi = {
  async getMyTemplates(): Promise<BlockTemplate[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('block_templates')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async createTemplate(template: Partial<BlockTemplate>): Promise<BlockTemplate> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('block_templates')
      .insert({
        id: crypto.randomUUID(),
        ...template,
        created_by: user.id
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async publishToMarket(templateId: string): Promise<void> {
    const { error } = await supabase
      .from('block_templates')
      .update({ is_published: true })
      .eq('id', templateId)
    
    if (error) throw error
  },

  async getTemplateById(id: string): Promise<BlockTemplate> {
    const { data, error } = await supabase
      .from('block_templates')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async updateTemplate(id: string, updates: Partial<BlockTemplate>): Promise<BlockTemplate> {
    const { data, error } = await supabase
      .from('block_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('block_templates')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}
