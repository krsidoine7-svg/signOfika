import { SupabaseClient } from '@supabase/supabase-js'

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SUPABASE_URL: string
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string
    }
  }
}

declare module '@supabase/supabase-js' {
  interface SupabaseClient {
    from(table: string): any
  }
}
