
export interface UserFormData {
  fullName: string;
  email: string;
  password: string;
  role: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  phone?: string;
  position?: string;
  language?: string;
  status?: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  phone?: string;
  position?: string;
  language?: string;
}
