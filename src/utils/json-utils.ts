
/**
 * Utility functions for handling JSON data consistently
 * particularly for interactions with Supabase
 */

import { JsonValue, JsonObject, JsonArray } from '@/types/core';

/**
 * Ensures a value is safe to be stored as JSON in Supabase
 * Handles conversion of JS objects/arrays to JSON-compatible format
 */
export function ensureJson<T>(value: T): T {
  if (value === null || value === undefined) {
    return value;
  }
  
  // If it's already a string (like from DB), don't process further
  if (typeof value === 'string') {
    return value;
  }
  
  // For objects and arrays, ensure they're JSON-compatible
  if (typeof value === 'object') {
    // For arrays of objects, process each item
    if (Array.isArray(value)) {
      return value.map(item => 
        typeof item === 'object' && item !== null ? cleanObject(item) : item
      ) as unknown as T;
    }
    
    // For regular objects
    if (value !== null) {
      return cleanObject(value) as unknown as T;
    }
  }
  
  return value;
}

/**
 * Safely parses JSON string to object/array
 * @param jsonString - The JSON string to parse
 * @param defaultValue - Default value if parsing fails
 */
export function parseJsonSafe<T>(jsonString: string | null | undefined, defaultValue: T): T {
  if (!jsonString) return defaultValue;
  
  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return defaultValue;
  }
}

/**
 * Clean an object to ensure it's JSON-compatible
 * Removes functions, converts dates to ISO strings, etc.
 */
function cleanObject(obj: Record<string, any>): JsonObject {
  const result: Record<string, JsonValue> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Skip functions
    if (typeof value === 'function') continue;
    
    // Handle null
    if (value === null) {
      result[key] = null;
      continue;
    }
    
    // Handle dates
    if (value instanceof Date) {
      result[key] = value.toISOString();
      continue;
    }
    
    // Recursive handling for objects
    if (typeof value === 'object' && !Array.isArray(value)) {
      result[key] = cleanObject(value);
      continue;
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
      result[key] = value.map(item => 
        typeof item === 'object' && item !== null 
          ? cleanObject(item) 
          : item as JsonValue
      );
      continue;
    }
    
    // Handle primitive values
    if (['string', 'number', 'boolean'].includes(typeof value)) {
      result[key] = value as JsonValue;
      continue;
    }
    
    // Skip other types
  }
  
  return result;
}

/**
 * Type guard to check if a value can be safely stored as JSON
 */
export function isJsonSerializable(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (['string', 'number', 'boolean'].includes(typeof value)) return true;
  
  try {
    JSON.stringify(value);
    return true;
  } catch {
    return false;
  }
}
