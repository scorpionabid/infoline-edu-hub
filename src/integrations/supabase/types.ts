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
          approved_at: string | null
          approved_by: string | null
          category_id: string
          column_id: string
          created_at: string
          created_by: string | null
          id: string
          rejected_by: string | null
          rejection_reason: string | null
          school_id: string
          status: string | null
          updated_at: string
          value: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          category_id: string
          column_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          rejected_by?: string | null
          rejection_reason?: string | null
          school_id: string
          status?: string | null
          updated_at?: string
          value?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          category_id?: string
          column_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
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
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string | null
          priority: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string | null
          priority?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string | null
          priority?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string
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
          created_at: string
          description: string | null
          id: string
          name: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      schools: {
        Row: {
          address: string | null
          admin_email: string | null
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
      sectors: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          region_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          region_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
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
      has_access_to_region: {
        Args: {
          _user_id: string
          _region_id: string
        }
        Returns: boolean
      }
      has_access_to_sector: {
        Args: {
          _user_id: string
          _sector_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      uuid_generate_v4: {
        Args: Record<PropertyKey, never>
        Returns: string
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
