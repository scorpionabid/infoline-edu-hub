export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_value: Json | null
          old_value: Json | null
          proxy_info: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          proxy_info?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          proxy_info?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          archived: boolean | null
          assignment: string | null
          column_count: number | null
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          name: string
          order_index: number
          priority: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          archived?: boolean | null
          assignment?: string | null
          column_count?: number | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          name: string
          order_index: number
          priority?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          archived?: boolean | null
          assignment?: string | null
          column_count?: number | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          name?: string
          order_index?: number
          priority?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      columns: {
        Row: {
          category_id: string | null
          created_at: string
          default_value: string | null
          help_text: string | null
          id: string
          is_required: boolean | null
          name: string
          options: Json | null
          order_index: number | null
          placeholder: string | null
          status: string | null
          type: string
          updated_at: string
          validation: Json | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          default_value?: string | null
          help_text?: string | null
          id?: string
          is_required?: boolean | null
          name: string
          options?: Json | null
          order_index?: number | null
          placeholder?: string | null
          status?: string | null
          type: string
          updated_at?: string
          validation?: Json | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          default_value?: string | null
          help_text?: string | null
          id?: string
          is_required?: boolean | null
          name?: string
          options?: Json | null
          order_index?: number | null
          placeholder?: string | null
          status?: string | null
          type?: string
          updated_at?: string
          validation?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "columns_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      data_entries: {
        Row: {
          approval_comment: string | null
          approved_at: string | null
          approved_by: string | null
          category_id: string
          column_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          proxy_created_by: string | null
          proxy_original_entity: string | null
          proxy_reason: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          school_id: string
          status: string | null
          updated_at: string
          value: string | null
        }
        Insert: {
          approval_comment?: string | null
          approved_at?: string | null
          approved_by?: string | null
          category_id: string
          column_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          proxy_created_by?: string | null
          proxy_original_entity?: string | null
          proxy_reason?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          school_id: string
          status?: string | null
          updated_at?: string
          value?: string | null
        }
        Update: {
          approval_comment?: string | null
          approved_at?: string | null
          approved_by?: string | null
          category_id?: string
          column_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          proxy_created_by?: string | null
          proxy_original_entity?: string | null
          proxy_reason?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          school_id?: string
          status?: string | null
          updated_at?: string
          value?: string | null
        }
        Relationships: [
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
            foreignKeyName: "data_entries_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      file_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      notification_delivery_log: {
        Row: {
          clicked_at: string | null
          created_at: string | null
          delivered_at: string | null
          delivery_method: string
          error_code: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          notification_id: string | null
          opened_at: string | null
          recipient_email: string | null
          sent_at: string | null
          status: string
          template_id: string | null
          user_id: string
        }
        Insert: {
          clicked_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_method: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          notification_id?: string | null
          opened_at?: string | null
          recipient_email?: string | null
          sent_at?: string | null
          status: string
          template_id?: string | null
          user_id: string
        }
        Update: {
          clicked_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_method?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          notification_id?: string | null
          opened_at?: string | null
          recipient_email?: string | null
          sent_at?: string | null
          status?: string
          template_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_delivery_log_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_delivery_log_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "notification_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_delivery_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          default_channels: string[] | null
          default_priority: string | null
          description: string | null
          email_template: string | null
          id: string
          is_active: boolean | null
          is_system: boolean | null
          message_template: string
          name: string
          sms_template: string | null
          title_template: string
          translations: Json | null
          type: string
          updated_at: string | null
          variables: string[] | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          default_channels?: string[] | null
          default_priority?: string | null
          description?: string | null
          email_template?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          message_template: string
          name: string
          sms_template?: string | null
          title_template: string
          translations?: Json | null
          type: string
          updated_at?: string | null
          variables?: string[] | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          default_channels?: string[] | null
          default_priority?: string | null
          description?: string | null
          email_template?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          message_template?: string
          name?: string
          sms_template?: string | null
          title_template?: string
          translations?: Json | null
          type?: string
          updated_at?: string | null
          variables?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          channel: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string | null
          metadata: Json | null
          priority: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          template_data: Json | null
          template_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          channel?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          metadata?: Json | null
          priority?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          template_data?: Json | null
          template_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          channel?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          metadata?: Json | null
          priority?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          template_data?: Json | null
          template_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "notification_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          language: string | null
          last_login: string | null
          phone: string | null
          position: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id: string
          language?: string | null
          last_login?: string | null
          phone?: string | null
          position?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          language?: string | null
          last_login?: string | null
          phone?: string | null
          position?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      regions: {
        Row: {
          admin_email: string | null
          admin_id: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          status: string | null
          updated_at: string
        }
        Insert: {
          admin_email?: string | null
          admin_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          admin_email?: string | null
          admin_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      report_templates: {
        Row: {
          config: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          status: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          status?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          status?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          content: Json | null
          created_at: string | null
          created_by: string
          description: string | null
          filters: Json | null
          id: string
          insights: string[] | null
          is_template: boolean | null
          recommendations: string[] | null
          shared_with: Json | null
          status: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          created_by: string
          description?: string | null
          filters?: Json | null
          id?: string
          insights?: string[] | null
          is_template?: boolean | null
          recommendations?: string[] | null
          shared_with?: Json | null
          status?: string | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          filters?: Json | null
          id?: string
          insights?: string[] | null
          is_template?: boolean | null
          recommendations?: string[] | null
          shared_with?: Json | null
          status?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      scheduled_notifications: {
        Row: {
          created_at: string | null
          created_by: string | null
          error_message: string | null
          id: string
          processed_at: string | null
          recipients: Json
          repeat_pattern: string | null
          scheduled_for: string
          status: string | null
          template_data: Json | null
          template_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          id?: string
          processed_at?: string | null
          recipients: Json
          repeat_pattern?: string | null
          scheduled_for: string
          status?: string | null
          template_data?: Json | null
          template_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          id?: string
          processed_at?: string | null
          recipients?: Json
          repeat_pattern?: string | null
          scheduled_for?: string
          status?: string | null
          template_data?: Json | null
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_notifications_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_notifications_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "notification_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      school_files: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          is_active: boolean | null
          school_id: string
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_active?: boolean | null
          school_id: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_active?: boolean | null
          school_id?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "school_files_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "file_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_files_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_links: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          school_id: string
          title: string
          updated_at: string | null
          url: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          school_id: string
          title: string
          updated_at?: string | null
          url: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          school_id?: string
          title?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_links_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          address: string | null
          admin_email: string | null
          admin_id: string | null
          completion_rate: number | null
          created_at: string
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
          updated_at: string
        }
        Insert: {
          address?: string | null
          admin_email?: string | null
          admin_id?: string | null
          completion_rate?: number | null
          created_at?: string
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
          updated_at?: string
        }
        Update: {
          address?: string | null
          admin_email?: string | null
          admin_id?: string | null
          completion_rate?: number | null
          created_at?: string
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
          updated_at?: string
        }
        Relationships: [
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
          },
        ]
      }
      sector_data_entries: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          category_id: string
          column_id: string
          created_at: string | null
          created_by: string | null
          id: string
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          sector_id: string
          status: string | null
          updated_at: string | null
          value: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          category_id: string
          column_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          sector_id: string
          status?: string | null
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          category_id?: string
          column_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          sector_id?: string
          status?: string | null
          updated_at?: string | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sector_data_entries_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sector_data_entries_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sector_data_entries_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      sectors: {
        Row: {
          admin_email: string | null
          admin_id: string | null
          completion_rate: number | null
          created_at: string
          description: string | null
          id: string
          name: string
          region_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          admin_email?: string | null
          admin_id?: string | null
          completion_rate?: number | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          region_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          admin_email?: string | null
          admin_id?: string | null
          completion_rate?: number | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          region_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sectors_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      status_transition_log: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          comment: string | null
          data_entry_id: string
          id: string
          metadata: Json | null
          new_status: string
          old_status: string
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          comment?: string | null
          data_entry_id: string
          id?: string
          metadata?: Json | null
          new_status: string
          old_status: string
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          comment?: string | null
          data_entry_id?: string
          id?: string
          metadata?: Json | null
          new_status?: string
          old_status?: string
        }
        Relationships: []
      }
      user_notification_preferences: {
        Row: {
          approval_notifications: boolean | null
          category_preferences: Json | null
          created_at: string | null
          daily_digest: boolean | null
          data_entry_notifications: boolean | null
          deadline_notifications: boolean | null
          deadline_reminders: string | null
          digest_frequency: string | null
          email_enabled: boolean | null
          id: string
          in_app_enabled: boolean | null
          language: string | null
          priority_filter: string[] | null
          push_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          sms_enabled: boolean | null
          system_notifications: boolean | null
          timezone: string | null
          updated_at: string | null
          user_id: string
          weekly_digest: boolean | null
        }
        Insert: {
          approval_notifications?: boolean | null
          category_preferences?: Json | null
          created_at?: string | null
          daily_digest?: boolean | null
          data_entry_notifications?: boolean | null
          deadline_notifications?: boolean | null
          deadline_reminders?: string | null
          digest_frequency?: string | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          language?: string | null
          priority_filter?: string[] | null
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sms_enabled?: boolean | null
          system_notifications?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
          weekly_digest?: boolean | null
        }
        Update: {
          approval_notifications?: boolean | null
          category_preferences?: Json | null
          created_at?: string | null
          daily_digest?: boolean | null
          data_entry_notifications?: boolean | null
          deadline_notifications?: boolean | null
          deadline_reminders?: string | null
          digest_frequency?: string | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          language?: string | null
          priority_filter?: string[] | null
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sms_enabled?: boolean | null
          system_notifications?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
          weekly_digest?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "user_notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          region_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          school_id: string | null
          sector_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          region_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          school_id?: string | null
          sector_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          region_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          school_id?: string | null
          sector_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_roles_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "user_roles_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approval_permission_check: {
        Args: { target_school_id: string; data_type?: string }
        Returns: boolean
      }
      approval_permission_check_v2: {
        Args: { target_school_id: string; data_type?: string }
        Returns: boolean
      }
      assign_region_admin: {
        Args: { user_id_param: string; region_id_param: string }
        Returns: Json
      }
      assign_school_admin: {
        Args: { user_id_param: string; school_id_param: string }
        Returns: Json
      }
      assign_school_admin_role: {
        Args: {
          p_user_id: string
          p_school_id: string
          p_region_id: string
          p_sector_id: string
        }
        Returns: Json
      }
      assign_sector_admin: {
        Args: { user_id_param: string; sector_id_param: string }
        Returns: Json
      }
      auto_approve_proxy_data: {
        Args: {
          p_school_id: string
          p_category_id: string
          p_proxy_user_id: string
        }
        Returns: {
          success: boolean
          message: string
          approved_count: number
        }[]
      }
      calculate_completion_rate: {
        Args: { school_id_param: string }
        Returns: number
      }
      calculate_percentage: {
        Args: { part_value: number; total_value: number }
        Returns: number
      }
      calculate_sector_completion_rate: {
        Args: { sector_id_param: string }
        Returns: number
      }
      can_access_category: {
        Args: { category_id: string; operation_type?: string }
        Returns: boolean
      }
      can_access_data_entry: {
        Args: { user_id_param: string; entry_id_param: string }
        Returns: boolean
      }
      can_regionadmin_view_role: {
        Args: { role_user_id: string }
        Returns: boolean
      }
      can_sectoradmin_view_role: {
        Args: { role_user_id: string }
        Returns: boolean
      }
      can_view_own_role: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      category_access_check: {
        Args: { category_id: string; operation_type?: string }
        Returns: boolean
      }
      category_access_check_v2: {
        Args: { category_id: string; operation_type?: string }
        Returns: boolean
      }
      check_approval_permissions: {
        Args: { target_school_id: string; data_type?: string }
        Returns: boolean
      }
      check_proxy_data_entry_permission: {
        Args: { user_id: string; user_role: string; target_school_id: string }
        Returns: boolean
      }
      check_region_name_uniqueness: {
        Args: { region_name: string; exclude_id?: string }
        Returns: boolean
      }
      clean_text: {
        Args: { input_text: string }
        Returns: string
      }
      cleanup_old_notifications: {
        Args: { p_days_old?: number }
        Returns: number
      }
      column_value_validator: {
        Args: { column_type: string; value_text: string }
        Returns: boolean
      }
      completion_rate_calculator: {
        Args: { school_id_param: string }
        Returns: number
      }
      create_audit_log: {
        Args: {
          p_user_id: string
          p_action: string
          p_entity_type: string
          p_entity_id: string
          p_old_value: Json
          p_new_value: Json
        }
        Returns: Json
      }
      create_notification_from_template: {
        Args: {
          p_template_name: string
          p_user_id: string
          p_template_data?: Json
          p_scheduled_for?: string
          p_channels?: string[]
        }
        Returns: string
      }
      current_user_profile: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      delete_user_roles: {
        Args: { user_id: string }
        Returns: undefined
      }
      generate_random_string: {
        Args: { string_length?: number }
        Returns: string
      }
      get_accessible_regions: {
        Args: { user_id_param: string }
        Returns: string[]
      }
      get_accessible_schools: {
        Args: { user_id_param: string }
        Returns: string[]
      }
      get_accessible_sectors: {
        Args: { user_id_param: string }
        Returns: string[]
      }
      get_auth_user_info_simple: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_auth_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_category_completion_report: {
        Args: {
          p_region_id?: string
          p_sector_id?: string
          p_category_id?: string
        }
        Returns: Json
      }
      get_current_user_profile: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_current_user_region_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_dashboard_statistics: {
        Args: { p_region_id?: string; p_sector_id?: string }
        Returns: Json
      }
      get_filtered_users: {
        Args: {
          p_role?: string[]
          p_region_id?: string
          p_sector_id?: string
          p_school_id?: string
          p_status?: string[]
          p_search?: string
          p_page?: number
          p_limit?: number
        }
        Returns: {
          user_json: Json
        }[]
      }
      get_filtered_users_count: {
        Args: {
          p_role?: string[]
          p_region_id?: string
          p_sector_id?: string
          p_school_id?: string
          p_status?: string[]
          p_search?: string
        }
        Returns: number
      }
      get_full_user_data: {
        Args: Record<PropertyKey, never> | { user_id_param: string }
        Returns: {
          id: string
          email: string
          full_name: string
          role: string
          region_id: string
          sector_id: string
          school_id: string
          phone: string
          user_position: string
          language: string
          avatar: string
          status: string
          last_login: string
          created_at: string
          updated_at: string
        }[]
      }
      get_notification_statistics: {
        Args: { p_user_id?: string; p_start_date?: string; p_end_date?: string }
        Returns: Json
      }
      get_proxy_data_status: {
        Args: { p_school_id: string; p_category_id: string }
        Returns: {
          is_proxy_data: boolean
          proxy_user_id: string
          proxy_reason: string
          data_status: string
          entry_count: number
        }[]
      }
      get_recent_activities: {
        Args: { limit_param?: number }
        Returns: {
          id: string
          action: string
          user_id: string
          entity_type: string
          entity_id: string
          created_at: string
        }[]
      }
      get_region_stats: {
        Args: { region_id_param: string }
        Returns: {
          total_sectors: number
          total_schools: number
          total_pending: number
          total_approved: number
          completion_rate: number
        }[]
      }
      get_regional_comparison_report: {
        Args: { p_date_from?: string; p_date_to?: string }
        Returns: Json
      }
      get_regions_with_admin_emails: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          description: string
          status: string
          created_at: string
          updated_at: string
          admin_email: string
        }[]
      }
      get_school_column_export_data: {
        Args: { p_school_id?: string; p_category_id?: string }
        Returns: Json
      }
      get_school_completion_stats: {
        Args: { p_school_id: string }
        Returns: {
          category_id: string
          category_name: string
          total_columns: number
          filled_columns: number
          completion_percentage: number
          status: string
        }[]
      }
      get_school_data_by_category: {
        Args: { p_school_id: string; p_category_id: string }
        Returns: Json
      }
      get_school_performance_report: {
        Args: {
          p_region_id?: string
          p_sector_id?: string
          p_date_from?: string
          p_date_to?: string
          p_category_id?: string
        }
        Returns: Json
      }
      get_sector_admin_email: {
        Args: { sector_id_param: string }
        Returns: string
      }
      get_sector_stats: {
        Args: { sector_id_param: string }
        Returns: {
          total_schools: number
          total_pending: number
          total_approved: number
          total_rejected: number
          completion_rate: number
        }[]
      }
      get_user_emails_by_ids: {
        Args: { user_ids: string[] }
        Returns: {
          id: string
          email: string
        }[]
      }
      get_user_region_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: Record<PropertyKey, never> | { user_id: string }
        Returns: string
      }
      get_user_role_safe: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_school_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_sector_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_access_to_region: {
        Args:
          | { _user_id: string; _region_id: string }
          | { target_region_id: string }
        Returns: boolean
      }
      has_access_to_school: {
        Args: { _user_id: string; _school_id: string }
        Returns: boolean
      }
      has_access_to_sector: {
        Args: { _user_id: string; _sector_id: string }
        Returns: boolean
      }
      has_category_access: {
        Args: { category_id_param: string }
        Returns: boolean
      }
      has_column_access: {
        Args: { column_id_param: string }
        Returns: boolean
      }
      has_region_access: {
        Args: { region_id_param: string }
        Returns: boolean
      }
      has_region_access_by_role: {
        Args: { user_id_param: string; region_id_param: string }
        Returns: boolean
      }
      has_role: {
        Args:
          | { _user_id: string; _role: Database["public"]["Enums"]["app_role"] }
          | { check_role: string }
        Returns: boolean
      }
      has_role_safe: {
        Args: { role_to_check: string }
        Returns: boolean
      }
      has_school_access: {
        Args: { school_id_param: string }
        Returns: boolean
      }
      has_school_access_by_role: {
        Args: { user_id_param: string; school_id_param: string }
        Returns: boolean
      }
      has_sector_access: {
        Args: { sector_id_param: string }
        Returns: boolean
      }
      has_sector_access_by_role: {
        Args: { user_id_param: string; sector_id_param: string }
        Returns: boolean
      }
      is_admin_of_entity: {
        Args: {
          user_id_param: string
          entity_type: string
          entity_id_param: string
        }
        Returns: boolean
      }
      is_authenticated: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      is_date_in_range: {
        Args: { check_date: string; start_date: string; end_date: string }
        Returns: boolean
      }
      is_in_same_sector: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      is_in_same_sector_and_not_regionadmin: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      is_regionadmin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_regionadmin_for_region: {
        Args: { region_id_param: string }
        Returns: boolean
      }
      is_school_in_sector: {
        Args: { school_id_param: string }
        Returns: boolean
      }
      is_schooladmin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_sectoradmin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_superadmin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_superadmin_secure: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_valid_json: {
        Args: { input_text: string }
        Returns: boolean
      }
      region_access_check: {
        Args: { target_region_id: string }
        Returns: boolean
      }
      safe_get_user_by_email: {
        Args: { _email: string }
        Returns: {
          id: string
          aud: string
          role: string
          email: string
          encrypted_password: string
          email_confirmed_at: string
          invited_at: string
          confirmation_token: string
          confirmation_sent_at: string
          recovery_token: string
          recovery_sent_at: string
          email_change: string
          email_change_token_new: string
          email_change_token_current: string
          email_change_confirm_status: number
          banned_until: string
          reauthentication_token: string
          reauthentication_sent_at: string
          is_super_admin: boolean
          created_at: string
          updated_at: string
          phone: string
          phone_confirmed_at: string
          phone_change: string
          phone_change_token: string
          phone_change_sent_at: string
          confirmed_at: string
          email_change_sent_at: string
          raw_app_meta_data: Json
          raw_user_meta_data: Json
          is_sso_user: boolean
          deleted_at: string
          is_anonymous: boolean
        }[]
      }
      safe_get_user_by_id: {
        Args: { user_id: string }
        Returns: Json
      }
      sectoradmin_can_see_school_user: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      should_send_notification: {
        Args: {
          p_user_id: string
          p_notification_type: string
          p_channel: string
          p_priority?: string
        }
        Returns: boolean
      }
      status_transition_validator: {
        Args: { current_status: string; new_status: string }
        Returns: boolean
      }
      test_search_path_fix: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      update_admin_emails: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_admin_emails_and_ids: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_entries_status: {
        Args: {
          p_school_id: string
          p_category_id: string
          p_status: string
          p_user_id: string
          p_reason?: string
        }
        Returns: {
          approval_comment: string | null
          approved_at: string | null
          approved_by: string | null
          category_id: string
          column_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          proxy_created_by: string | null
          proxy_original_entity: string | null
          proxy_reason: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          school_id: string
          status: string | null
          updated_at: string
          value: string | null
        }[]
      }
      update_user_metadata: {
        Args: { p_user_id: string; p_metadata: Json }
        Returns: undefined
      }
      update_user_role: {
        Args: {
          p_user_id: string
          p_role: string
          p_school_id?: string
          p_region_id?: string
          p_sector_id?: string
        }
        Returns: undefined
      }
      user_has_role_new: {
        Args: { check_role: string }
        Returns: boolean
      }
      user_role_check: {
        Args: { role_name: string }
        Returns: boolean
      }
      uuid_generate_v4: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      validate_column_value: {
        Args:
          | { column_type: string; value_text: string }
          | { p_column_id: string; p_value: string }
        Returns: boolean
      }
      validate_status_transition: {
        Args: { current_status: string; new_status: string }
        Returns: boolean
      }
      verify_notification_system: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      view_own_role_check: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      app_role: "superadmin" | "regionadmin" | "sectoradmin" | "schooladmin"
      column_type:
        | "text"
        | "number"
        | "date"
        | "select"
        | "checkbox"
        | "radio"
        | "file"
        | "image"
      data_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["superadmin", "regionadmin", "sectoradmin", "schooladmin"],
      column_type: [
        "text",
        "number",
        "date",
        "select",
        "checkbox",
        "radio",
        "file",
        "image",
      ],
      data_status: ["pending", "approved", "rejected"],
    },
  },
} as const
