export interface Site {
  id: string
  profile_id: string
  name: string
  description?: string
  seo_config?: SEOConfig
  published: boolean
  repo_name?: string
  repo_url?: string
  pages_url?: string
  custom_domain?: string
  repo_id?: string
  repo_full_name?: string
  created_at: string
}

export interface Page {
  id: string
  site_id: string
  name: string
  path: string
  sort_order: number
  seo_config?: SEOConfig
  translations?: Record<string, string>
  created_at: string
}

export interface SEOConfig {
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
}

export interface SiteGlobals {
  id: string
  site_id: string
  nav_config?: any
  footer_config?: any
  i18n_config?: {
    primary: string
    enabled: string[]
  }
  translations?: Record<string, {
    nav_config?: any
    footer_config?: any
  }>
}
