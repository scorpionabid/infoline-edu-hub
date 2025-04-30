
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';

export interface AssignUserRoleParams {
  userId: string;
  role: UserRole;
  entityId?: string; // region_id, sector_id, school_id
}

export interface ManageEntityParams {
  action: "create" | "read" | "update" | "delete";
  entityType: "column" | "region" | "sector" | "school" | "category";
  data: any;
}

export interface DashboardDataParams {
  role: UserRole;
  entityId?: string;
}

export interface CacheConfig {
  key: string;
  ttl: number; // saniyələrlə
  dependencies?: string[];
}
