/**
 * UUID validation and safety utilities
 */

export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const getDBSafeUUID = (uuid: string | null | undefined): string | null => {
  if (!uuid || typeof uuid !== 'string') return null;
  return isValidUUID(uuid) ? uuid : null;
};

// Keep backward compatibility
export const getSafeUUID = getDBSafeUUID;

export const generateUUID = (): string => {
  return crypto.randomUUID();
};
