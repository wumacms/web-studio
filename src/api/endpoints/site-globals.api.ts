import { supabase } from '@/api/supabase/client'
import type { SiteGlobals } from '@/types/models/site'

export const siteGlobalsApi = {
  async getGlobals(siteId: string): Promise<SiteGlobals | null> {
    const { data, error } = await supabase
      .from('site_globals')
      .select('*')
      .eq('site_id', siteId)
      .maybeSingle()
    
    if (error) throw error
    return data
  },

  async upsertGlobals(globals: Partial<SiteGlobals>): Promise<SiteGlobals> {
    const { data, error } = await supabase
      .from('site_globals')
      .upsert(globals, { onConflict: 'site_id' })
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}
