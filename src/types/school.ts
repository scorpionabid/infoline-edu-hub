
export interface School {
  id: string;
  name: string;
  status?: string;
  region_id?: string;
  region_name?: string;
  sector_id?: string;
  sector_name?: string;
  admin_id?: string;
  admin_name?: string;
  admin_email?: string;
  principal_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  student_count?: number;
  teacher_count?: number;
  created_at?: string;
  updated_at?: string;
  completion_rate?: number;
  completionRate?: number;
}

export interface SchoolsStatistics {
  total: number;
  active: number;
  inactive: number;
  archived?: number;
  count?: number;
  draft?: number;
}

export interface SchoolWithStats extends School {
  stats?: SchoolsStatistics;
}

export interface EnhancedSchool extends School {
  region?: {
    id: string;
    name: string;
  };
  sector?: {
    id: string;
    name: string;
  };
  admin?: {
    id: string;
    name: string;
    email: string;
  };
}

// Type conversions
export type SchoolStatus = 'active' | 'inactive' | 'archived' | string;

// For backward compatibility
export type { School as SchoolProfile };
