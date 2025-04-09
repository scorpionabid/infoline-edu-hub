
// Database tipleri

export enum TableNames {
  CATEGORIES = 'categories',
  COLUMNS = 'columns',
  DATA_ENTRIES = 'data_entries',
  NOTIFICATIONS = 'notifications',
  PROFILES = 'profiles',
  REGIONS = 'regions',
  REPORTS = 'reports',
  REPORT_TEMPLATES = 'report_templates',
  SCHOOLS = 'schools',
  SECTORS = 'sectors',
  USER_ROLES = 'user_roles',
  AUDIT_LOGS = 'audit_logs'
}

export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';

export type UserStatus = 'active' | 'inactive' | 'blocked';

export type EntityType = 'region' | 'sector' | 'school' | 'category' | 'column' | 'report';

export type ActionType = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'approve' 
  | 'reject' 
  | 'assign_admin'
  | 'submit'
  | 'share'
  | 'publish'
  | 'archive';
