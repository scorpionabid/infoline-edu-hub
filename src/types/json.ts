
/**
 * Type definitions for JSON handling
 */

// Basic JSON value types
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export type JsonArray = JsonValue[];
export interface JsonObject { [key: string]: JsonValue }

// Generic JSON type
export type Json = JsonValue;

/**
 * Ensures a value can be safely stored as JSON in Supabase
 */
export function ensureJson<T>(value: T): T {
  if (value === null || value === undefined) {
    return value;
  }
  
  // For objects and arrays, ensure they're JSON-compatible
  if (typeof value === 'object') {
    try {
      // Test if value can be serialized
      JSON.stringify(value);
      return value;
    } catch (e) {
      console.error('Error converting to JSON:', e);
      // Return empty object or array if serialization fails
      if (Array.isArray(value)) return [] as unknown as T;
      return {} as T;
    }
  }
  
  return value;
}
