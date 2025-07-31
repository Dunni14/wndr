import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  phone: string
  name?: string
  email?: string
  created_at: string
}

export interface Memory {
  id: string
  title: string
  description?: string
  mood?: string
  latitude: number
  longitude: number
  image_url?: string
  visit_date: string
  user_id: string
  created_at: string
}