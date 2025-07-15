// Define the EnhancedSector type
export interface EnhancedSector extends Sector {
  region_name?: string;
  school_count?: number;
}

// Basic Sector interface
export interface Sector {
  id: string;
  name: string;
  description?: string;
  region_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  admin_id?: string;
  admin_email?: string;
  completion_rate?: number;
}

// Define Region interface
export interface Region {
  id: string;
  name: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
  admin_id?: string;
  admin_email?: string;
}

// Define School interface
export interface School {
  id: string;
  name: string;
  region_id: string;
  sector_id: string;
  address?: string;
  phone?: string;
  email?: string;
  principal_name?: string;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  status?: string;
  admin_id?: string;
  admin_email?: string;
  language?: string;
  created_at: string;
  updated_at: string;
  completion_rate?: number;
  region_name?: string;
  sector_name?: string;
}

// Define SchoolStat interface for backward compatibility
export interface SchoolStat {
  id: string;
  name: string;
  status?: string;
  completionRate: number;
  lastUpdate?: string;
  pendingForms?: number;
  formsCompleted?: number;
  totalForms?: number;
  principalName?: string;
  address?: string;
  phone?: string;
  email?: string;
}

// ============================================================================
// Re-export auth types from main auth.ts file to avoid duplication
// ============================================================================
import { UserRole, FullUserData } from './auth';

// Define NotificationSettings type (Supabase-specific version)
export interface NotificationSettings {
  email: boolean;
  inApp: boolean;
  push: boolean;
  system: boolean;
  deadline: boolean;
}

// Enhanced FullUserData with missing properties
export interface EnhancedFullUserData extends FullUserData {
  entity_name?: string;
  entityName?: string;
  deleted_at?: string;
  deletedAt?: string;
}

// Re-export for backward compatibility
export type { UserRole, FullUserData };
