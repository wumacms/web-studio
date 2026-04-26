import { supabase } from '@/api/supabase/client'
import type { BlockInstance } from '@/types/models/block'

export const blockApi = {
  async getPageBlocks(pageId: string): Promise<BlockInstance[]> {
    const { data, error } = await supabase
      .from('block_instances')
      .select('*')
      .eq('page_id', pageId)
      .order('sort_order', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  async upsertBlocks(pageId: string, blocks: BlockInstance[]): Promise<void> {
    if (blocks.length === 0) {
      const { error: deleteError } = await supabase
        .from('block_instances')
        .delete()
        .eq('page_id', pageId)
      
      if (deleteError) throw deleteError
      return
    }

    // Clean data of reactive proxies to avoid serialization issues
    const cleanBlocks = JSON.parse(JSON.stringify(blocks)).map((b: any) => ({
      ...b,
      page_id: pageId
    }))

    const { error: upsertError } = await supabase
      .from('block_instances')
      .upsert(cleanBlocks, { onConflict: 'id' })
    
    if (upsertError) throw upsertError
  },

  async deleteBlock(id: string): Promise<void> {
    const { error } = await supabase
      .from('block_instances')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}
