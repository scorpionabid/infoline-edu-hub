
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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      categories: {
        Row: {
          archived_at: string | null
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          name: string
          priority: number
          status: string
          target: string | null
          updated_at: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          name: string
          priority?: number
          status?: string
          target?: string | null
          updated_at?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          name?: string
          priority?: number
          status?: string
          target?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      columns: {
        Row: {
          category_id: string
          created_at: string | null
          default_value: string | null
          help_text: string | null
          id: string
          is_required: boolean
          name: string
          options: Json | null
          order_index: number
          parent_column_id: string | null
          placeholder: string | null
          status: string
          type: string
          updated_at: string | null
          validation: Json | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          default_value?: string | null
          help_text?: string | null
          id?: string
          is_required?: boolean
          name: string
          options?: Json | null
          order_index: number
          parent_column_id?: string | null
          placeholder?: string | null
          status?: string
          type: string
          updated_at?: string | null
          validation?: Json | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          default_value?: string | null
          help_text?: string | null
          id?: string
          is_required?: boolean
          name?: string
          options?: Json | null
          order_index?: number
          parent_column_id?: string | null
          placeholder?: string | null
          status?: string
          type?: string
          updated_at?: string | null
          validation?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "columns_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      data_entries: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          category_id: string
          column_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          rejection_reason: string | null
          rejected_at: string | null
          rejected_by: string | null
          school_id: string
          status: string
          updated_at: string | null
          value: string | null
          version: number | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          category_id: string
          column_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          rejection_reason?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          school_id: string
          status?: string
          updated_at?: string | null
          value?: string | null
          version?: number | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          category_id?: string
          column_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          rejection_reason?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          school_id?: string
          status?: string
          updated_at?: string | null
          value?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "data_entries_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_entries_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_entries_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_entries_rejected_by_fkey"
            columns: ["rejected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_entries_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_read: boolean
          priority: string | null
          reference_id: string | null
          reference_type: string | null
          title: string
          type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_read?: boolean
          priority?: string | null
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_read?: boolean
          priority?: string | null
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          language: string | null
          last_login: string | null
          phone: string | null
          position: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          language?: string | null
          last_login?: string | null
          phone?: string | null
          position?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          language?: string | null
          last_login?: string | null
          phone?: string | null
          position?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      regions: {
        Row: {
          admin_email: string | null
          admin_id: string | null
          cover_image: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          admin_email?: string | null
          admin_id?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_email?: string | null
          admin_id?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      schools: {
        Row: {
          address: string | null
          admin_email: string | null
          admin_id: string | null
          coordinates: Json | null
          created_at: string | null
          email: string | null
          id: string
          language: string | null
          logo: string | null
          name: string
          phone: string | null
          principal_name: string | null
          region_id: string
          sector_id: string
          status: string | null
          student_count: number | null
          teacher_count: number | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          admin_email?: string | null
          admin_id?: string | null
          coordinates?: Json | null
          created_at?: string | null
          email?: string | null
          id?: string
          language?: string | null
          logo?: string | null
          name: string
          phone?: string | null
          principal_name?: string | null
          region_id: string
          sector_id: string
          status?: string | null
          student_count?: number | null
          teacher_count?: number | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          admin_email?: string | null
          admin_id?: string | null
          coordinates?: Json | null
          created_at?: string | null
          email?: string | null
          id?: string
          language?: string | null
          logo?: string | null
          name?: string
          phone?: string | null
          principal_name?: string | null
          region_id?: string
          sector_id?: string
          status?: string | null
          student_count?: number | null
          teacher_count?: number | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schools_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schools_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schools_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          }
        ]
      }
      sectors: {
        Row: {
          admin_email: string | null
          admin_id: string | null
          cover_image: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          region_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          admin_email?: string | null
          admin_id?: string | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          region_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_email?: string | null
          admin_id?: string | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          region_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sectors_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sectors_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          }
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          region_id: string | null
          role: string
          school_id: string | null
          sector_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          region_id?: string | null
          role: string
          school_id?: string | null
          sector_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          region_id?: string | null
          role?: string
          school_id?: string | null
          sector_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_roles_region_id"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_roles_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_roles_sector_id"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user_roles: {
        Args: {
          user_id: string
        }
        Returns: undefined
      }
      get_full_user_data: {
        Args: {
          user_id_arg: string
        }
        Returns: {
          id: string
          full_name: string
          email: string
          phone: string
          avatar: string
          position: string
          status: string
          language: string
          role: string
          region_id: string
          region_name: string
          sector_id: string
          sector_name: string
          school_id: string
          school_name: string
          last_login: string
        }[]
      }
      get_regions_with_admin_emails: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          description: string
          admin_id: string
          admin_email: string
        }[]
      }
      get_sector_admin_email: {
        Args: {
          sector_id_arg: string
        }
        Returns: string
      }
      sync_email_to_profile: {
        Args: {
          user_id_arg: string
        }
        Returns: undefined
      }
      uuid_generate_v4: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
