
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
};

export type DbResult<T> = {
  data: T;
  error: PostgrestError | null;
};
