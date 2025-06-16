
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const validateUserIdForDB = (userId: string): string => {
  if (!isValidUUID(userId)) {
    throw new Error('Invalid user ID format');
  }
  return userId;
};

export const getDBSafeUUID = (uuid: string): string => {
  if (!isValidUUID(uuid)) {
    throw new Error('Invalid UUID format');
  }
  return uuid;
};

export const sanitizeUUID = (uuid: string): string => {
  return uuid.replace(/[^a-f0-9-]/gi, '');
};
