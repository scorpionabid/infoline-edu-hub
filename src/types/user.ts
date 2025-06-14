
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar?: string;
  phone?: string;
  position?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface UserFilter {
  region?: string;
  sector?: string;
  role?: string;
  status?: string;
  search?: string;
}
