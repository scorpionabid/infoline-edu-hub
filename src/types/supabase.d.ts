
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';

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
          role: UserRole;
          region_id: string | null;
          sector_id: string | null;
          school_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: UserRole;
          region_id?: string | null;
          sector_id?: string | null;
          school_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: UserRole;
          region_id?: string | null;
          sector_id?: string | null;
          school_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
