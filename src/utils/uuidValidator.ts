
/**
 * UUID validation and conversion utilities
 * Prevents sending invalid string values to UUID database columns
 */

import { v4 as uuidv4 } from 'uuid';

export const isValidUUID = (str: any): boolean => {
  if (!str || typeof str !== 'string') return false;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Converts potentially invalid UUID values to database-safe values
 * Returns null for system operations instead of "system" string
 */
export const getDBSafeUUID = (value: any, context?: string): string | null => {
  // Log the validation attempt for debugging
  console.log(`[UUID Validator] ${context || 'Unknown'} - Input:`, value, typeof value);
  
  // Handle null/undefined
  if (!value) return null;
  
  // Handle string values
  if (typeof value === 'string') {
    // Never allow these system-like strings
    if (value === 'system' || value === 'undefined' || value === 'null') {
      console.warn(`[UUID Validator] ${context || 'Unknown'} - Blocked invalid system string: ${value}`);
      return null;
    }
    
    // Check if it's a valid UUID
    if (isValidUUID(value)) {
      return value;
    }
    
    console.warn(`[UUID Validator] ${context || 'Unknown'} - Invalid UUID format: ${value}`);
    return null;
  }
  
  console.warn(`[UUID Validator] ${context || 'Unknown'} - Non-string UUID value:`, value);
  return null;
};

/**
 * Generates a new UUID for system operations
 */
export const generateSystemUUID = (): string => {
  return uuidv4();
};

/**
 * Validates and cleans user ID for database operations
 */
export const validateUserIdForDB = (userId: any, operation: string): string | null => {
  const result = getDBSafeUUID(userId, `User ID for ${operation}`);
  
  if (!result) {
    console.error(`[UUID Validator] Invalid user ID for ${operation}:`, userId);
  }
  
  return result;
};
