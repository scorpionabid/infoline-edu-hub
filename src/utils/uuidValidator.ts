
// UUID validation utilities

export const isValidUUID = (value: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

export const getDBSafeUUID = (value: string | null | undefined, allowNull: boolean = true): string | null => {
  if (!value) {
    return allowNull ? null : '';
  }
  
  if (typeof value !== 'string') {
    return allowNull ? null : '';
  }
  
  return isValidUUID(value) ? value : (allowNull ? null : '');
};

// Legacy compatibility
export const getSafeUUID = getDBSafeUUID;

export const generateTempUUID = (): string => {
  return 'temp-' + Math.random().toString(36).substring(2, 15);
};

export const sanitizeUUIDArray = (uuids: (string | null | undefined)[]): string[] => {
  return uuids
    .filter((uuid): uuid is string => Boolean(uuid && isValidUUID(uuid)));
};
