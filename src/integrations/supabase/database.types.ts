
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          avatar: string | null;
          phone: string | null;
          position: string | null;
          language: string;
          last_login: string | null;
          created_at: string;
          updated_at: string;
          status: string;
          email: string | null;
        };
        Insert: {
          id: string;
          full_name: string;
          avatar?: string | null;
          phone?: string | null;
          position?: string | null;
          language?: string;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
          status?: string;
          email?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string;
          avatar?: string | null;
          phone?: string | null;
          position?: string | null;
          language?: string;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
          status?: string;
          email?: string | null;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: string;
          region_id: string | null;
          sector_id: string | null;
          school_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: string;
          region_id?: string | null;
          sector_id?: string | null;
          school_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: string;
          region_id?: string | null;
          sector_id?: string | null;
          school_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      regions: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
          status: string;
          admin_id: string | null;
          admin_email: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          status?: string;
          admin_id?: string | null;
          admin_email?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          status?: string;
          admin_id?: string | null;
          admin_email?: string | null;
        };
      };
      sectors: {
        Row: {
          id: string;
          region_id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
          status: string;
          admin_id: string | null;
          admin_email: string | null;
        };
        Insert: {
          id?: string;
          region_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          status?: string;
          admin_id?: string | null;
          admin_email?: string | null;
        };
        Update: {
          id?: string;
          region_id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          status?: string;
          admin_id?: string | null;
          admin_email?: string | null;
        };
      };
      schools: {
        Row: {
          id: string;
          name: string;
          principal_name: string | null;
          address: string | null;
          region_id: string;
          sector_id: string;
          phone: string | null;
          email: string | null;
          student_count: number | null;
          teacher_count: number | null;
          status: string;
          type: string | null;
          language: string | null;
          created_at: string;
          updated_at: string;
          completion_rate: number | null;
          logo: string | null;
          admin_email: string | null;
          admin_id: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          principal_name?: string | null;
          address?: string | null;
          region_id: string;
          sector_id: string;
          phone?: string | null;
          email?: string | null;
          student_count?: number | null;
          teacher_count?: number | null;
          status?: string;
          type?: string | null;
          language?: string | null;
          created_at?: string;
          updated_at?: string;
          completion_rate?: number | null;
          logo?: string | null;
          admin_email?: string | null;
          admin_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          principal_name?: string | null;
          address?: string | null;
          region_id?: string;
          sector_id?: string;
          phone?: string | null;
          email?: string | null;
          student_count?: number | null;
          teacher_count?: number | null;
          status?: string;
          type?: string | null;
          language?: string | null;
          created_at?: string;
          updated_at?: string;
          completion_rate?: number | null;
          logo?: string | null;
          admin_email?: string | null;
          admin_id?: string | null;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          assignment: string;
          deadline: string | null;
          status: string;
          priority: number | null;
          created_at: string;
          updated_at: string;
          archived: boolean | null;
          column_count: number | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          assignment?: string;
          deadline?: string | null;
          status?: string;
          priority?: number | null;
          created_at?: string;
          updated_at?: string;
          archived?: boolean | null;
          column_count?: number | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          assignment?: string;
          deadline?: string | null;
          status?: string;
          priority?: number | null;
          created_at?: string;
          updated_at?: string;
          archived?: boolean | null;
          column_count?: number | null;
        };
      };
      columns: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          type: string;
          is_required: boolean | null;
          placeholder: string | null;
          help_text: string | null;
          order_index: number | null;
          status: string;
          validation: unknown | null;
          default_value: string | null;
          options: unknown | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          name: string;
          type: string;
          is_required?: boolean | null;
          placeholder?: string | null;
          help_text?: string | null;
          order_index?: number | null;
          status?: string;
          validation?: unknown | null;
          default_value?: string | null;
          options?: unknown | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          name?: string;
          type?: string;
          is_required?: boolean | null;
          placeholder?: string | null;
          help_text?: string | null;
          order_index?: number | null;
          status?: string;
          validation?: unknown | null;
          default_value?: string | null;
          options?: unknown | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      data_entries: {
        Row: {
          id: string;
          school_id: string;
          category_id: string;
          column_id: string;
          value: string | null;
          status: string;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          approved_by: string | null;
          approved_at: string | null;
          rejected_by: string | null;
          rejection_reason: string | null;
        };
        Insert: {
          id?: string;
          school_id: string;
          category_id: string;
          column_id: string;
          value?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          rejected_by?: string | null;
          rejection_reason?: string | null;
        };
        Update: {
          id?: string;
          school_id?: string;
          category_id?: string;
          column_id?: string;
          value?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          rejected_by?: string | null;
          rejection_reason?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
