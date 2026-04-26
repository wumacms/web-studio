import { supabase } from '@/api/supabase/client'

export type MarketItemType = 'BLOCK' | 'PAGE' | 'SITE'


export const marketApi = {
  async getMarketItems(type: MarketItemType, category?: string): Promise<any[]> {
    let tableName = ''
    switch (type) {
      case 'BLOCK': tableName = 'block_templates'; break
      case 'PAGE': tableName = 'page_templates'; break
      case 'SITE': tableName = 'site_templates'; break
    }

    let query = supabase
      .from(tableName)
      .select('*')
      .eq('is_published', true)
    
    if (category && category !== 'All') {
      query = query.eq('category', category)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async deleteMarketItem(type: MarketItemType, id: string): Promise<void> {
    let tableName = ''
    switch (type) {
      case 'BLOCK': tableName = 'block_templates'; break
      case 'PAGE': tableName = 'page_templates'; break
      case 'SITE': tableName = 'site_templates'; break
    }

    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}


