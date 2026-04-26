export interface UserProfile {
  id: string
  github_id: string
  username: string
  github_username?: string
  github_avatar_url?: string
  github_token?: string
  avatar_url?: string
  metadata?: Record<string, any>
  created_at: string
}
