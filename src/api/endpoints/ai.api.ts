import { supabase } from '@/api/supabase/client'

export const aiApi = {
  async generateContent(prompt: string, context: string): Promise<string> {
    const { data, error } = await supabase.functions.invoke('ai-generate', {
      body: { prompt, context }
    })
    
    if (error) {
      console.error('AI Generation Error:', error)
      throw new Error(error.message || 'Failed to generate content')
    }
    
    return data.text
  },

  async searchImages(query: string): Promise<string[]> {
    // We can use Unsplash Source API for quick results
    // Example: https://source.unsplash.com/featured/?{query}
    // Or simulate a few high-quality Unsplash URLs
    return [
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80&sig=1',
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80&sig=2',
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80&sig=3'
    ].map(url => `${url}&${query}`)
  },

  async generateSiteStructure(prompt: string): Promise<{ siteName: string, templateId: string, content: Record<string, any> }> {
    const { data, error } = await supabase.functions.invoke('ai-site-builder', {
      body: { prompt }
    })
    
    if (error) {
      console.error('AI Site Builder Error:', error)
      throw new Error(error.message || 'Failed to generate site structure')
    }
    
    return data
  }
}
