// Build fixes and compatibility helpers

// Type guard functions
export const isValidArray = <T>(value: any): value is T[] => {
  return Array.isArray(value);
};

export const isValidString = (value: any): value is string => {
  return typeof value === 'string';
};

export const isValidObject = (value: any): value is object => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

// Safe type conversions
export const safeStringConversion = (value: any): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  return '';
};

export const safeArrayConversion = <T>(value: any): T[] => {
  if (Array.isArray(value)) return value as T[];
  return [];
};

// Database safe helpers
export const ensureValidStatus = (status: any): 'active' | 'inactive' => {
  return ['active', 'inactive'].includes(status) ? status : 'active';
};

export const ensureValidSchoolStatus = (status: any): 'active' | 'inactive' | 'pending' | 'archived' => {
  return ['active', 'inactive', 'pending', 'archived'].includes(status) ? status : 'active';
};

export const ensureValidRole = (role: any): 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user' => {
  const validRoles = ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin', 'user'];
  return validRoles.includes(role) ? role : 'user';
};

// Safe JSON parsing with type casting
export const safeJsonParse = <T>(jsonString: any, fallback: T): T => {
  if (typeof jsonString === 'object' && jsonString !== null) {
    return jsonString as T;
  }
  
  if (typeof jsonString === 'string') {
    try {
      return JSON.parse(jsonString) as T;
    } catch {
      return fallback;
    }
  }
  
  return fallback;
};

// Safe JSON array parsing for reports
export const safeJsonArrayParse = <T>(data: any): T[] => {
  if (Array.isArray(data)) {
    return data as T[];
  }
  
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed as T[] : [];
    } catch {
      return [];
    }
  }
  
  return [];
};

// Safe JSON object parsing for reports  
export const safeJsonObjectParse = <T extends object>(data: any): T | null => {
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    return data as T;
  }
  
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) ? parsed as T : null;
    } catch {
      return null;
    }
  }
  
  return null;
};

// Report data type casting
export const ensureReportDataArray = <T>(data: any, fallback: T[] = []): T[] => {
  return safeJsonArrayParse<T>(data) || fallback;
};

export const ensureReportDataObject = <T extends object>(data: any, fallback: T): T => {
  return safeJsonObjectParse<T>(data) || fallback;
};

// User status validation
export const ensureUserStatus = (status: any): 'active' | 'inactive' => {
  return ['active', 'inactive'].includes(status) ? status : 'active';
};

// Safe sector status casting
export const ensureSectorStatus = (status: any): 'active' | 'inactive' => {
  return ['active', 'inactive'].includes(status) ? status : 'active';
};

// Safe role array filter
export const safeRoleFilter = (role: any): '' | 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user' => {
  if (Array.isArray(role)) {
    return role.length > 0 ? ensureValidRole(role[0]) : '';
  }
  return role === '' ? '' : ensureValidRole(role);
};

// Safe status array filter
export const safeStatusFilter = (status: any): '' | 'active' | 'inactive' => {
  if (Array.isArray(status)) {
    return status.length > 0 ? ensureValidStatus(status[0]) : '';
  }
  return status === '' ? '' : ensureValidStatus(status);
};

// Type safe property accessors
export const safePropertyAccess = <T extends object, K extends keyof T>(obj: T, key: K): T[K] | undefined => {
  return obj && typeof obj === 'object' ? obj[key] : undefined;
};

// Safe array element access
export const safeArrayAccess = <T>(arr: T[], index: number): T | undefined => {
  return Array.isArray(arr) && index >= 0 && index < arr.length ? arr[index] : undefined;
};

// Safe function parameter validation
export const validateNotificationSettings = (settings: any) => {
  if (!settings || typeof settings !== 'object') {
    return {
      email_notifications: true,
      sms_notifications: false,
      push_notifications: true,
    };
  }
  
  return {
    email_notifications: Boolean(settings.email_notifications ?? true),
    sms_notifications: Boolean(settings.sms_notifications ?? false), 
    push_notifications: Boolean(settings.push_notifications ?? true),
  };
};

// Enhanced school data type casting
export const ensureEnhancedSchoolData = (data: any): any => {
  if (!data || typeof data !== 'object') return null;
  
  return {
    id: data.id || '',
    name: data.name || '',
    region_id: data.region_id || '',
    sector_id: data.sector_id || '',
    status: ensureValidSchoolStatus(data.status),
    completion_rate: Number(data.completion_rate) || 0,
    principal_name: data.principal_name || '',
    region_name: data.region_name || '',
    sector_name: data.sector_name || '',
    columns: data.columns || {},
    completion_stats: data.completion_stats || {
      total_required: 0,
      filled_count: 0,
      approved_count: 0,
      completion_rate: 0,
    },
    ...data
  };
};

// User data property mapping helper
export const mapUserDataProperties = (userData: any): any => {
  if (!userData || typeof userData !== 'object') return userData;
  
  return {
    ...userData,
    full_name: userData.full_name || userData.fullName || '',
    region_id: userData.region_id || userData.regionId,
    sector_id: userData.sector_id || userData.sectorId,
    school_id: userData.school_id || userData.schoolId,
    status: ensureUserStatus(userData.status),
  };
};

// Entity display name helper
export const getEntityDisplayName = (userData: any): string => {
  if (!userData || typeof userData !== 'object') return '';
  
  const role = userData.role;
  
  if (role === 'regionadmin' && userData.region_name) {
    return userData.region_name;
  }
  
  if (role === 'sectoradmin' && userData.sector_name) {
    return userData.sector_name;
  }
  
  if (role === 'schooladmin' && userData.school_name) {
    return userData.school_name;
  }
  
  return '';
};

// Safe region status casting
export const ensureRegionStatus = (status: any): 'active' | 'inactive' => {
  return ['active', 'inactive'].includes(status) ? status : 'active';
};

// Enhanced region data type casting with safe status conversion
export const ensureEnhancedRegionData = (data: any): any => {
  if (!data || typeof data !== 'object') return null;
  
  return {
    ...data,
    status: ensureRegionStatus(data.status),
    // Ensure all expected properties exist
    name_az: data.name_az || data.name || '',
    name_en: data.name_en || data.name || '',
    sectors_count: Number(data.sectors_count) || 0,
    schools_count: Number(data.schools_count) || 0,
    sector_count: Number(data.sector_count) || Number(data.sectors_count) || 0,
    school_count: Number(data.school_count) || Number(data.schools_count) || 0,
    admin_name: data.admin_name || data.adminName || '',
    adminName: data.adminName || data.admin_name || '',
    adminEmail: data.adminEmail || data.admin_email || '',
    completion_rate: Number(data.completion_rate) || Number(data.completionRate) || 0,
    completionRate: Number(data.completionRate) || Number(data.completion_rate) || 0,
  };
};

// Enhanced role and status validation
export const ensureValidUserRole = (role: any): 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user' => {
  const validRoles = ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin', 'user'];
  return validRoles.includes(role) ? role : 'user';
};

export const ensureValidUserStatus = (status: any): 'active' | 'inactive' => {
  return ['active', 'inactive'].includes(status) ? status : 'active';
};

// Safe role filter for SQL queries (excludes 'user' role when needed)
export const safeAdminRoleFilter = (role: any): '' | 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' => {
  if (Array.isArray(role)) {
    const validRole = role.length > 0 ? role[0] : '';
    return ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin'].includes(validRole) ? validRole : '';
  }
  return ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin'].includes(role) ? role : '';
};

// Safe status array filter with proper typing
export const safeUserStatusFilter = (status: any): '' | 'active' | 'inactive' => {
  if (Array.isArray(status)) {
    return status.length > 0 ? ensureValidUserStatus(status[0]) : '';
  }
  return status === '' ? '' : ensureValidUserStatus(status);
};

// Enhanced sector data type casting
export const ensureSectorDataEntryStatus = (status: any): 'draft' | 'submitted' | 'approved' | 'rejected' => {
  const validStatuses = ['draft', 'submitted', 'approved', 'rejected'];
  return validStatuses.includes(status) ? status : 'draft';
};

// Safe sector data entry casting
export const ensureSectorDataEntry = (data: any): any => {
  if (!data || typeof data !== 'object') return null;
  
  return {
    ...data,
    status: ensureSectorDataEntryStatus(data.status)
  };
};

// Enhanced data entry params interface
export interface EnhancedDataEntryParams {
  column_id: string;
  category_id: string;
  school_id: string;
  value: string;
  status?: string;
  created_by?: string;
  approved_by?: string;
}

// Safe data entry updates validation
export const validateDataEntryUpdates = (updates: any): Partial<EnhancedDataEntryParams> => {
  const validatedUpdates: Partial<EnhancedDataEntryParams> = {};
  
  if (updates.column_id) validatedUpdates.column_id = updates.column_id;
  if (updates.category_id) validatedUpdates.category_id = updates.category_id;
  if (updates.school_id) validatedUpdates.school_id = updates.school_id;
  if (updates.value !== undefined) validatedUpdates.value = updates.value;
  if (updates.status) validatedUpdates.status = updates.status;
  if (updates.created_by && isValidUUID(updates.created_by)) validatedUpdates.created_by = updates.created_by;
  if (updates.approved_by && isValidUUID(updates.approved_by)) validatedUpdates.approved_by = updates.approved_by;
  
  return validatedUpdates;
};
