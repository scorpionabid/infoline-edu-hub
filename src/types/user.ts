
export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'teacher';
  status: 'active' | 'inactive';
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  phone?: string;
  address?: string;
  hire_date?: string;
  department?: string;
  position?: string;
}

export interface UserFilter {
  search?: string;
  role?: string;
  status?: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  page?: number;
  limit?: number;
}
