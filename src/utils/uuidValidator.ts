
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
