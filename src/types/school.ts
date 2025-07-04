
// School related types - enhanced with missing exports

export interface Region {
  id: string;
  name: string;
  status?: string;
  description?: string;
  admin_id?: string;
  admin_email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Sector {
  id: string;
  name: string;
  region_id: string;
  status?: string;
  description?: string;
  admin_id?: string;
  admin_email?: string;
  completion_rate?: number;
  created_at?: string;
  updated_at?: string;
}

export interface School {
  completion_rate?: number;
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  principal_name?: string;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  language?: string;
  region_id: string;
  sector_id: string;
  admin_id?: string;
  admin_email?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at?: string;
  
  // Relational data (optional)
  region_name?: string;
  sector_name?: string;
  regionName?: string; // Compatibility alias
  sectorName?: string; // Compatibility alias
}

export interface SchoolFormData {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  principal_name?: string;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  language?: string;
  region_id: string;
  sector_id: string;
  status?: 'active' | 'inactive';
}

// Missing exports that were causing build errors
export interface SchoolAdmin {
  id: string;
  user_id: string;
  school_id: string;
  created_at: string;
  updated_at?: string;
}

export interface SchoolCreateParams {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  principal_name?: string;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  language?: string;
  region_id: string;
  sector_id: string;
  status?: 'active' | 'inactive';
}

export interface SchoolUpdateParams {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  principal_name?: string;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  language?: string;
  region_id?: string;
  sector_id?: string;
  status?: 'active' | 'inactive';
}

export interface EnhancedSchool extends School {
  admin_count?: number;
  completion_rate?: number;
  last_activity?: string;
}
