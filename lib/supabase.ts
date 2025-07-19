import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Check if we're in a build environment or missing credentials
const isConfigured = supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey !== 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Export a function to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return isConfigured
}

// Database types
export interface Database {
  public: {
    Tables: {
      conversations: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          current_step: number
          form_data: Json
          completed: boolean
          session_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          current_step: number
          form_data: Json
          completed?: boolean
          session_id: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          current_step?: number
          form_data?: Json
          completed?: boolean
          session_id?: string
        }
      }
      form_submissions: {
        Row: {
          id: string
          created_at: string
          conversation_id: string
          form_type: string
          form_data: Json
          pdf_generated: boolean
          pdf_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          conversation_id: string
          form_type: string
          form_data: Json
          pdf_generated?: boolean
          pdf_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          conversation_id?: string
          form_type?: string
          form_data?: Json
          pdf_generated?: boolean
          pdf_url?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          created_at: string
          conversation_id: string
          message_text: string
          sender: 'user' | 'ai'
          message_order: number
        }
        Insert: {
          id?: string
          created_at?: string
          conversation_id: string
          message_text: string
          sender: 'user' | 'ai'
          message_order: number
        }
        Update: {
          id?: string
          created_at?: string
          conversation_id?: string
          message_text?: string
          sender?: 'user' | 'ai'
          message_order?: number
        }
      }
    }
  }
}

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'] 