
/**
 * Unikal identifikator generasiya edir
 * @returns Unikal ID string
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
