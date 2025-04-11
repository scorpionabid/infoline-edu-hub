
export enum TableNames {
  REGIONS = 'regions',
  SECTORS = 'sectors',
  SCHOOLS = 'schools', 
  CATEGORIES = 'categories',
  COLUMNS = 'columns',
  DATA_ENTRIES = 'data_entries',
  USERS = 'users',
  PROFILES = 'profiles',
  USER_ROLES = 'user_roles',
  NOTIFICATIONS = 'notifications',
  AUDIT_LOGS = 'audit_logs'
}

export interface DatabaseError {
  code: string;
  message: string;
  details?: string;
  hint?: string;
}
