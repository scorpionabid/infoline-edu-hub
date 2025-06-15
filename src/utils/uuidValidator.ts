
export const validateUserIdForDB = (userId: string): boolean => {
  // UUID v4 regex pattern
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(userId);
};

export const validateUUID = (uuid: string): boolean => {
  return validateUserIdForDB(uuid);
};

export const isValidUUID = (uuid: string): boolean => {
  return validateUserIdForDB(uuid);
};
