export interface BlockTemplate {
  id: string
  name: string
  category: string
  html_code: string
  schema: any
  preview_image?: string
  is_published?: boolean
  created_by?: string
  origin?: 'SYSTEM' | 'USER'
  created_at?: string
}

export interface BlockInstance {
  id: string
  page_id: string
  source_template_id: string
  copied_html_code: string
  copied_schema: any
  props_data: Record<string, any>
  translations?: Record<string, Record<string, any>> // { "zh": { "title": "...", "subtitle": "..." } }
  sort_order: number
  created_at?: string
}
