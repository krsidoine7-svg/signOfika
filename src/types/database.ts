export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'user' | 'admin' | 'integration'
          company_name: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin' | 'integration'
          company_name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin' | 'integration'
          company_name?: string | null
          phone?: string | null
          updated_at?: string
        }
      }
      folders: {
        Row: {
          id: string
          name: string
          user_id: string
          parent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          user_id: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          parent_id?: string | null
          updated_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          folder_id: string | null
          user_id: string
          schema: Json
          preferences: Json
          is_archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          folder_id?: string | null
          user_id: string
          schema?: Json
          preferences?: Json
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          folder_id?: string | null
          schema?: Json
          preferences?: Json
          is_archived?: boolean
          updated_at?: string
        }
      }
      template_documents: {
        Row: {
          id: string
          template_id: string
          file_path: string
          file_name: string
          file_size: number | null
          page_count: number | null
          preview_images: Json
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          template_id: string
          file_path: string
          file_name: string
          file_size?: number | null
          page_count?: number | null
          preview_images?: Json
          position?: number
          created_at?: string
        }
        Update: {
          file_path?: string
          file_name?: string
          file_size?: number | null
          page_count?: number | null
          preview_images?: Json
          position?: number
        }
      }
      submissions: {
        Row: {
          id: string
          template_id: string
          slug: string
          user_id: string
          status: 'pending' | 'completed' | 'declined' | 'expired'
          is_archived: boolean
          metadata: Json
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          template_id: string
          slug: string
          user_id: string
          status?: 'pending' | 'completed' | 'declined' | 'expired'
          is_archived?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          status?: 'pending' | 'completed' | 'declined' | 'expired'
          is_archived?: boolean
          metadata?: Json
          updated_at?: string
          completed_at?: string | null
        }
      }
      submitters: {
        Row: {
          id: string
          submission_id: string
          email: string
          name: string | null
          slug: string
          role: 'signer' | 'viewer' | 'approver'
          status: 'pending' | 'opened' | 'completed' | 'declined'
          position: number
          values: Json
          signature_url: string | null
          initials_url: string | null
          ip_address: string | null
          user_agent: string | null
          sent_at: string | null
          opened_at: string | null
          completed_at: string | null
          declined_at: string | null
          decline_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          email: string
          name?: string | null
          slug: string
          role?: 'signer' | 'viewer' | 'approver'
          status?: 'pending' | 'opened' | 'completed' | 'declined'
          position?: number
          values?: Json
          signature_url?: string | null
          initials_url?: string | null
          ip_address?: string | null
          user_agent?: string | null
          sent_at?: string | null
          opened_at?: string | null
          completed_at?: string | null
          declined_at?: string | null
          decline_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          name?: string | null
          status?: 'pending' | 'opened' | 'completed' | 'declined'
          values?: Json
          signature_url?: string | null
          initials_url?: string | null
          ip_address?: string | null
          user_agent?: string | null
          opened_at?: string | null
          completed_at?: string | null
          declined_at?: string | null
          decline_reason?: string | null
          updated_at?: string
        }
      }
      submission_documents: {
        Row: {
          id: string
          submission_id: string
          submitter_id: string | null
          file_path: string
          file_name: string
          file_size: number | null
          created_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          submitter_id?: string | null
          file_path: string
          file_name: string
          file_size?: number | null
          created_at?: string
        }
        Update: {
          file_path?: string
          file_name?: string
          file_size?: number | null
        }
      }
      attachments: {
        Row: {
          id: string
          submitter_id: string
          file_path: string
          file_name: string
          file_size: number | null
          content_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          submitter_id: string
          file_path: string
          file_name: string
          file_size?: number | null
          content_type?: string | null
          created_at?: string
        }
        Update: {
          file_path?: string
          file_name?: string
          file_size?: number | null
          content_type?: string | null
        }
      }
      events: {
        Row: {
          id: string
          event_type: string
          event_data: Json
          submission_id: string | null
          submitter_id: string | null
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_type: string
          event_data?: Json
          submission_id?: string | null
          submitter_id?: string | null
          user_id?: string | null
          created_at?: string
        }
        Update: {
          event_type?: string
          event_data?: Json
        }
      }
      webhooks: {
        Row: {
          id: string
          user_id: string
          url: string
          secret: string | null
          events: string[]
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          url: string
          secret?: string | null
          events?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          url?: string
          secret?: string | null
          events?: string[]
          is_active?: boolean
          updated_at?: string
        }
      }
      api_keys: {
        Row: {
          id: string
          user_id: string
          name: string
          key_hash: string
          last_used_at: string | null
          created_at: string
          expires_at: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          key_hash: string
          last_used_at?: string | null
          created_at?: string
          expires_at?: string | null
          is_active?: boolean
        }
        Update: {
          name?: string
          last_used_at?: string | null
          expires_at?: string | null
          is_active?: boolean
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          smtp_config: Json
          storage_config: Json
          notification_preferences: Json
          branding: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          smtp_config?: Json
          storage_config?: Json
          notification_preferences?: Json
          branding?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          smtp_config?: Json
          storage_config?: Json
          notification_preferences?: Json
          branding?: Json
          updated_at?: string
        }
      }
    }
  }
}

// Helper types
export type Template = Database['public']['Tables']['templates']['Row']
export type Submission = Database['public']['Tables']['submissions']['Row']
export type Submitter = Database['public']['Tables']['submitters']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Folder = Database['public']['Tables']['folders']['Row']
export type TemplateDocument = Database['public']['Tables']['template_documents']['Row']
export type SubmissionDocument = Database['public']['Tables']['submission_documents']['Row']
export type Attachment = Database['public']['Tables']['attachments']['Row']
export type Event = Database['public']['Tables']['events']['Row']
export type Webhook = Database['public']['Tables']['webhooks']['Row']
export type ApiKey = Database['public']['Tables']['api_keys']['Row']
export type UserSettings = Database['public']['Tables']['user_settings']['Row']

// Field types for template schema
export type FieldType = 
  | 'signature'
  | 'initials'
  | 'text'
  | 'date'
  | 'number'
  | 'email'
  | 'phone'
  | 'checkbox'
  | 'radio'
  | 'select'
  | 'file'
  | 'image'

export interface Field {
  id: string
  name: string
  type: FieldType
  required: boolean
  submitter_id?: string
  page: number
  x: number
  y: number
  width: number
  height: number
  options?: string[] // For select, radio
  placeholder?: string
  default_value?: string | number | boolean
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

export interface TemplateSchema {
  fields: Field[]
  submitters: {
    id: string
    name: string
    email?: string
    role: 'signer' | 'viewer' | 'approver'
  }[]
}
