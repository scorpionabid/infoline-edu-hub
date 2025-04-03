
import { PostgrestError } from "@supabase/supabase-js";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string | null;
          avatar: string | null;
          phone: string | null;
          position: string | null;
          language: string | null;
          last_login: string | null;
          status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email?: string | null;
          avatar?: string | null;
          phone?: string | null;
          position?: string | null;
          language?: string | null;
          last_login?: string | null;
          status?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string | null;
          avatar?: string | null;
          phone?: string | null;
          position?: string | null;
          language?: string | null;
          last_login?: string | null;
          status?: string | null;
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
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: string;
          region_id?: string | null;
          sector_id?: string | null;
          school_id?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_full_user_data: {
        Args: {
          user_id_param: string;
        };
        Returns: Json;
      };
      get_user_role_safe: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      app_role: "superadmin" | "regionadmin" | "sectoradmin" | "schooladmin";
    };
  };
};

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type InsertProfile = Database['public']['Tables']['profiles']['Insert'];
export type UpdateProfile = Database['public']['Tables']['profiles']['Update'];

export type UserRole = Database['public']['Tables']['user_roles']['Row'];
export type InsertUserRole = Database['public']['Tables']['user_roles']['Insert'];
export type UpdateUserRole = Database['public']['Tables']['user_roles']['Update'];

export type AppRole = Database['public']['Enums']['app_role'];

export type NotificationSettings = {
  email: boolean;
  system: boolean;
};

export type FullUserData = {
  id: string;
  email: string;
  full_name: string;
  name?: string;
  role: AppRole;
  region_id?: string;
  regionId?: string;
  sector_id?: string;
  sectorId?: string;
  school_id?: string;
  schoolId?: string;
  phone?: string;
  position?: string;
  language?: string;
  avatar?: string;
  status?: string;
  last_login?: string;
  lastLogin?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  notificationSettings?: NotificationSettings;
  twoFactorEnabled?: boolean;
};

export type DbResult<T> = {
  data: T;
  error: PostgrestError | null;
};

// Burada School, Region, Sector və DataEntry kimi əsas modellər əlavə edirik ki, supabase ilə problemsiz inteqrasiya olsun
export type School = {
  id: string;
  name: string;
  region_id: string;
  sector_id: string;
  address?: string;
  phone?: string;
  email?: string;
  principal_name?: string;
  status?: string;
  type?: string;
  language?: string;
  student_count?: number;
  teacher_count?: number;
  completion_rate?: number;
  admin_email?: string;
  logo?: string;
  created_at?: string;
  updated_at?: string;
};

export type Region = {
  id: string;
  name: string;
  description?: string;
  status?: string;
  admin_id?: string;
  admin_email?: string;
  created_at?: string;
  updated_at?: string;
};

export type Sector = {
  id: string;
  name: string;
  region_id: string;
  description?: string;
  status?: string;
  admin_email?: string;
  created_at?: string;
  updated_at?: string;
};

export type DataEntry = {
  id: string;
  category_id: string;
  column_id: string;
  school_id: string;
  value?: string;
  status?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
};

// User ilə əlaqəli əlavə tiplər
export type CreateUserData = {
  email: string;
  password: string;
  full_name: string;
  role: AppRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  phone?: string;
  position?: string;
  language?: string;
  status?: string;
};

export type UpdateUserData = {
  email?: string;
  full_name?: string;
  role?: AppRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  phone?: string;
  position?: string;
  language?: string;
  status?: string;
  avatar?: string;
  notificationSettings?: NotificationSettings;
  twoFactorEnabled?: boolean;
};
