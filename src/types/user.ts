
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  created_at?: string;
  last_sign_in_at?: string;
  avatar_url?: string;
  phone?: string;
}
