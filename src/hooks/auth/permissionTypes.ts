
import { UserRole } from '@/types/supabase';

export type PermissionLevel = 'read' | 'write' | 'delete' | 'admin';

export interface PermissionResult {
  granted: boolean;
  message: string;
  code?: string;
}

export type PermissionChecker = (userId: string, entityId: string, level?: PermissionLevel) => Promise<PermissionResult>;

export interface UserWithRole {
  id: string;
  email?: string;
  role?: UserRole | 'user';
  region_id?: string;
  sector_id?: string;
  school_id?: string;
}
