import { supabase } from '@/api/supabase/client'

export const favoritesApi = {
  async getFavorites(userId: string): Promise<any[]> {
    if (!userId) return []

    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('profile_id', userId)
    
    if (error) throw error
    return data || []
  },

  async toggleFavorite(userId: string, itemType: string, itemId: string): Promise<boolean> {
    if (!userId) throw new Error('Not authenticated')

    // Check if exists
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('profile_id', userId)
      .eq('item_type', itemType)
      .eq('item_id', itemId)
      .single()

    if (existing) {
      await supabase.from('favorites').delete().eq('id', existing.id)
      return false
    } else {
      await supabase.from('favorites').insert({
        profile_id: userId,
        item_type: itemType,
        item_id: itemId
      })
      return true
    }
  }
}

