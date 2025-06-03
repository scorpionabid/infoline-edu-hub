
export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  role?: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
}

export interface UserFilter {
  role?: string;
  search?: string;
  status?: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
}

export interface CreateUserData {
  email: string;
  full_name: string;
  phone?: string;
  role: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
}
