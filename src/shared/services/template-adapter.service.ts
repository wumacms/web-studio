import { supabase } from '@/api/supabase/client'
import type { BlockInstance } from '@/types/models/block'

export interface NormalizedPreviewData {
  siteName: string;
  globals: {
    nav_config?: any;
    footer_config?: any;
    i18n_config?: any;
  };
  pages: Array<{
    id: string;
    name: string;
    path: string;
    blocks: BlockInstance[];
  }>;
}

export const templateAdapter = {
  async normalize(type: 'BLOCK' | 'PAGE' | 'SITE', id: string): Promise<NormalizedPreviewData> {
    const tableName = type === 'BLOCK' ? 'block_templates' : type === 'PAGE' ? 'page_templates' : 'site_templates'
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error

    if (type === 'BLOCK') {
      return {
        siteName: data.name,
        globals: {},
        pages: [{
          id: 'preview-page',
          name: data.name,
          path: '/',
          blocks: [{
            id: 'preview-block',
            source_template_id: data.id,
            copied_html_code: data.html_code,
            copied_schema: data.schema,
            props_data: this.extractDefaults(data.schema),
            sort_order: 0,
            created_at: new Date().toISOString()
          } as BlockInstance]
        }]
      }
    }

    if (type === 'PAGE') {
      return {
        siteName: data.name,
        globals: {},
        pages: [{
          id: 'preview-page',
          name: data.name,
          path: '/',
          blocks: data.blocks.map((b: any, index: number) => ({
            ...b,
            id: `b-${index}`,
            sort_order: index
          }))
        }]
      }
    }

    if (type === 'SITE') {
      return {
        siteName: data.name,
        globals: {
          nav_config: data.nav_config,
          footer_config: data.footer_config,
          i18n_config: data.i18n_config
        },
        pages: data.pages.map((p: any, pIndex: number) => ({
          id: `p-${pIndex}`,
          name: p.name,
          path: p.path,
          blocks: p.blocks.map((b: any, bIndex: number) => ({
            ...b,
            id: `b-${pIndex}-${bIndex}`,
            sort_order: bIndex
          }))
        }))
      }
    }

    throw new Error('Unsupported template type')
  },

  extractDefaults(schema: any): any {
    const defaults: any = {}
    if (schema?.properties) {
      Object.keys(schema.properties).forEach(key => {
        if (schema.properties[key].default !== undefined) {
          defaults[key] = schema.properties[key].default
        }
      })
    }
    return defaults
  }
}
