// Supabase database types — mirrors migrations 001 + 002
// Regenerate after applying migrations:
//   npx supabase gen types typescript --project-id <id> > lib/supabase/types.ts

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    PostgrestVersion: '12'
    Tables: {
      wordpress_sites: {
        Row: {
          id: string
          name: string
          url: string
          wp_user: string | null
          wp_app_password: string | null
          is_active: boolean
          last_status: 'online' | 'offline' | 'warning' | null
          last_checked_at: string | null
          domain_expiry_at: string | null
          created_at: string
        }
        Insert: {
          name: string
          url: string
          wp_user?: string | null
          wp_app_password?: string | null
          is_active?: boolean
          last_status?: 'online' | 'offline' | 'warning' | null
          last_checked_at?: string | null
          domain_expiry_at?: string | null
        }
        Update: {
          name?: string
          url?: string
          wp_user?: string | null
          wp_app_password?: string | null
          is_active?: boolean
          last_status?: 'online' | 'offline' | 'warning' | null
          last_checked_at?: string | null
          domain_expiry_at?: string | null
        }
        Relationships: []
      }
      dev_tasks: {
        Row: {
          id: string
          sheet_row_id: string | null
          title: string
          description: string | null
          status: 'todo' | 'in_progress' | 'done' | 'blocked'
          priority: 'low' | 'medium' | 'high' | null
          project: string | null
          due_date: string | null
          clarification_notes: string | null
          synced_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          sheet_row_id?: string | null
          title: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'done' | 'blocked'
          priority?: 'low' | 'medium' | 'high' | null
          project?: string | null
          due_date?: string | null
          clarification_notes?: string | null
          synced_at?: string | null
        }
        Update: {
          sheet_row_id?: string | null
          title?: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'done' | 'blocked'
          priority?: 'low' | 'medium' | 'high' | null
          project?: string | null
          due_date?: string | null
          clarification_notes?: string | null
          synced_at?: string | null
        }
        Relationships: []
      }
      dev_logs: {
        Row: {
          id: string
          log_date: string
          done: string | null
          blocked: string | null
          next: string | null
          created_at: string
        }
        Insert: {
          log_date: string
          done?: string | null
          blocked?: string | null
          next?: string | null
        }
        Update: {
          log_date?: string
          done?: string | null
          blocked?: string | null
          next?: string | null
        }
        Relationships: []
      }
      trading_entries: {
        Row: {
          id: string
          entry_date: string
          session: 'morning' | 'afternoon' | 'evening' | null
          market: string | null
          direction: 'long' | 'short' | null
          entry_price: number | null
          exit_price: number | null
          lot_size: number | null
          pnl: number | null
          result: 'win' | 'loss' | 'breakeven' | null
          notes: string | null
          telegram_msg_id: number | null
          created_at: string
        }
        Insert: {
          entry_date: string
          session?: 'morning' | 'afternoon' | 'evening' | null
          market?: string | null
          direction?: 'long' | 'short' | null
          entry_price?: number | null
          exit_price?: number | null
          lot_size?: number | null
          pnl?: number | null
          result?: 'win' | 'loss' | 'breakeven' | null
          notes?: string | null
          telegram_msg_id?: number | null
        }
        Update: {
          entry_date?: string
          session?: 'morning' | 'afternoon' | 'evening' | null
          market?: string | null
          direction?: 'long' | 'short' | null
          entry_price?: number | null
          exit_price?: number | null
          lot_size?: number | null
          pnl?: number | null
          result?: 'win' | 'loss' | 'breakeven' | null
          notes?: string | null
          telegram_msg_id?: number | null
        }
        Relationships: []
      }
      content_items: {
        Row: {
          id: string
          title: string
          content_type: 'fb_post' | 'blog' | 'video_script'
          status: 'idea' | 'outlined' | 'drafted' | 'published'
          raw_idea: string | null
          ai_outline: string | null
          final_content: string | null
          scheduled_for: string | null
          published_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          content_type: 'fb_post' | 'blog' | 'video_script'
          status?: 'idea' | 'outlined' | 'drafted' | 'published'
          raw_idea?: string | null
          ai_outline?: string | null
          final_content?: string | null
          scheduled_for?: string | null
          published_url?: string | null
        }
        Update: {
          title?: string
          content_type?: 'fb_post' | 'blog' | 'video_script'
          status?: 'idea' | 'outlined' | 'drafted' | 'published'
          raw_idea?: string | null
          ai_outline?: string | null
          final_content?: string | null
          scheduled_for?: string | null
          published_url?: string | null
        }
        Relationships: []
      }
      learning_entries: {
        Row: {
          id: string
          entry_date: string
          entry_type: 'reading' | 'ai_tool' | 'english' | 'other'
          title: string
          source: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          entry_date: string
          entry_type: 'reading' | 'ai_tool' | 'english' | 'other'
          title: string
          source?: string | null
          notes?: string | null
        }
        Update: {
          entry_date?: string
          entry_type?: 'reading' | 'ai_tool' | 'english' | 'other'
          title?: string
          source?: string | null
          notes?: string | null
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          id: string
          channel: 'telegram' | 'email'
          notif_type: string
          payload: Json | null
          status: 'sent' | 'failed' | 'skipped'
          error_msg: string | null
          sent_at: string
        }
        Insert: {
          channel: 'telegram' | 'email'
          notif_type: string
          payload?: Json | null
          status: 'sent' | 'failed' | 'skipped'
          error_msg?: string | null
        }
        Update: {
          channel?: 'telegram' | 'email'
          notif_type?: string
          payload?: Json | null
          status?: 'sent' | 'failed' | 'skipped'
          error_msg?: string | null
        }
        Relationships: []
      }
      briefing_tasks: {
        Row: {
          id: string
          title: string
          status: 'todo' | 'done' | 'skipped'
          priority: number
          source: 'sheet' | 'manual'
          sheet_row_id: string | null
          ai_score: number | null
          ai_note: string | null
          task_date: string
          created_at: string
        }
        Insert: {
          title: string
          status?: 'todo' | 'done' | 'skipped'
          priority?: number
          source?: 'sheet' | 'manual'
          sheet_row_id?: string | null
          ai_score?: number | null
          ai_note?: string | null
          task_date?: string
        }
        Update: {
          title?: string
          status?: 'todo' | 'done' | 'skipped'
          priority?: number
          source?: 'sheet' | 'manual'
          sheet_row_id?: string | null
          ai_score?: number | null
          ai_note?: string | null
          task_date?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Convenience row type aliases
export type BriefingTask    = Database['public']['Tables']['briefing_tasks']['Row']
export type WordPressSite   = Database['public']['Tables']['wordpress_sites']['Row']
export type DevTask         = Database['public']['Tables']['dev_tasks']['Row']
export type DevLog          = Database['public']['Tables']['dev_logs']['Row']
export type TradingEntry    = Database['public']['Tables']['trading_entries']['Row']
export type ContentItem     = Database['public']['Tables']['content_items']['Row']
export type LearningEntry   = Database['public']['Tables']['learning_entries']['Row']
export type NotificationLog = Database['public']['Tables']['notification_logs']['Row']
