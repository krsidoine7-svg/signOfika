export type ApiKey = {
  id: string
  user_id: string
  name: string
  key_hash: string
  prefix: string
  created_at: string
  last_used_at: string | null
  is_active: boolean
}
