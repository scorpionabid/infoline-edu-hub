
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';

// Region model
export interface Region {
  id: string;
  name: string;
  description?: string;
  admin_id?: string;
  admin_email?: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'inactive' | string;
}

// Sector model
export interface Sector {
  id: string;
  name: string;
  description?: string;
  region_id: string;
  admin_id?: string;
  admin_email?: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'inactive' | string;
  completion_rate?: number;
  region_name?: string; // Added for convenience in UI
}

// Enhanced sector with additional fields
export interface EnhancedSector extends Sector {
  region_name: string;
  school_count: number;
  completion_rate: number;
}

// School model
export interface School {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  region_id: string;
  sector_id: string;
  admin_id?: string;
  admin_email?: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'inactive' | string;
  logo?: string;
  principal_name?: string;
  principalName?: string; // TypeScript camelCase alias
  type?: string;
  teacher_count?: number;
  student_count?: number;
  language?: string;
  completion_rate?: number;
}

// Full User Data for authentication and profile
export interface FullUserData {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole | string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  status?: string;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
  language?: string;
  avatar?: string;
  position?: string;
  entityName?: string;
  name?: string; // Alias for full_name
  regionId?: string; // Alias for region_id
  sectorId?: string; // Alias for sector_id
  schoolId?: string; // Alias for school_id
  lastLogin?: string; // Alias for last_login
  createdAt?: string; // Alias for created_at
  updatedAt?: string; // Alias for updated_at
}

export interface NotificationSettings {
  email: boolean;
  inApp: boolean;
  push?: boolean;
  sms?: boolean;
  system: boolean;
  deadline: boolean;
  deadlineReminders?: boolean;
}

// Add SchoolStat type to avoid conflicting definitions
export interface SchoolStat extends School {
  completion_rate: number;
  formsTotal: number;
  formsCompleted: number;
  formsPending: number;
  lastUpdate?: string; // Match with dashboard.d.ts definition
  pendingForms: number;
  completionRate?: number;
  principal?: string;
  principalName?: string;
}
