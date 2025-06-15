
// School related types
export type SchoolStatus = 'active' | 'inactive' | 'pending' | 'archived';

export interface SchoolFilter {
  region?: string;
  sector?: string;
  status?: SchoolStatus;
  search?: string;
}

export interface SchoolData {
  id: string;
  name: string;
  region_id: string;
  sector_id: string;
  status: SchoolStatus;
  admin_id?: string;
  admin_email?: string;
  phone?: string;
  email?: string;
  address?: string;
  principal_name?: string;
  student_count?: number;
  teacher_count?: number;
  completion_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface EnhancedSchoolData extends SchoolData {
  region_name?: string;
  sector_name?: string;
  completion_rate: number;
  columns?: Record<string, any>;
  completion_stats?: {
    total_required: number;
    filled_count: number;
    approved_count: number;
    completion_rate: number;
  };
}

// Legacy aliases for backward compatibility
export interface School extends SchoolData {}
export interface Region {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  admin_id?: string;
  admin_email?: string;
  created_at: string;
  updated_at: string;
}

export interface Sector {
  id: string;
  name: string;
  description?: string;
  region_id: string;
  admin_id?: string;
  admin_email?: string;
  status: 'active' | 'inactive';
  completion_rate?: number;
  created_at: string;
  updated_at: string;
}
