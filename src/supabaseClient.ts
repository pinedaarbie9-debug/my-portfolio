import { createClient } from '@supabase/supabase-js'

// These come from your Vercel/local env vars — see setup-instructions.md
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'Add them to your .env file (local) and Vercel Environment Variables (deployed).'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const PORTFOLIO_BUCKET = 'portfolio-images'
export const PORTFOLIO_ROW_ID = 1 // single-row table holding the whole portfolio object