
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

// JSON parsing safety
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

// Report data type casting
export const ensureReportDataArray = <T>(data: any, fallback: T[] = []): T[] => {
  if (isValidArray(data)) {
    return data as T[];
  }
  
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return isValidArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }
  
  return fallback;
};

export const ensureReportDataObject = <T extends object>(data: any, fallback: T): T => {
  if (isValidObject(data)) {
    return data as T;
  }
  
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return isValidObject(parsed) ? parsed as T : fallback;
    } catch {
      return fallback;
    }
  }
  
  return fallback;
};
