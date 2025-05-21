
/**
 * Database table names and related constants
 */

export enum TableNames {
  USERS = 'profiles',
  REGIONS = 'regions',
  SECTORS = 'sectors',
  SCHOOLS = 'schools',
  USER_ROLES = 'user_roles',
  CATEGORIES = 'categories',
  COLUMNS = 'columns',
  DATA_ENTRIES = 'data_entries',
  NOTIFICATIONS = 'notifications',
  REPORTS = 'reports',
  REPORT_TEMPLATES = 'report_templates',
  SECTOR_DATA_ENTRIES = 'sector_data_entries',
  AUDIT_LOGS = 'audit_logs'
}

export enum StorageBuckets {
  AVATARS = 'avatars',
  SCHOOL_LOGOS = 'school-logos',
  DOCUMENTS = 'documents',
  EXPORTS = 'exports'
}

export enum DbSchemas {
  PUBLIC = 'public',
  AUTH = 'auth',
  STORAGE = 'storage'
}

export enum DbFunctions {
  GET_USER_ROLE = 'get_user_role',
  HAS_ROLE = 'has_role',
  IS_SUPERADMIN = 'is_superadmin',
  IS_REGIONADMIN = 'is_regionadmin',
  HAS_ACCESS_TO_REGION = 'has_access_to_region',
  HAS_ACCESS_TO_SECTOR = 'has_access_to_sector'
}
