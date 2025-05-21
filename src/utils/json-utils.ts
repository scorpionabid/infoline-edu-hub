
/**
 * Utility functions for handling JSON data
 */

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export type JsonArray = JsonValue[];
export interface JsonObject { [key: string]: JsonValue }

/**
 * Type guard to check if a value is a valid JSON object
 */
export function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard to check if a value is a valid JSON array
 */
export function isJsonArray(value: unknown): value is JsonArray {
  return Array.isArray(value);
}

/**
 * Ensures a value can be safely stored as JSON in Supabase
 * @param value The value to ensure is JSON compatible
 * @returns A JSON-safe version of the value
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

/**
 * Safely parse a JSON string with fallback to default value
 * @param value The JSON string to parse
 * @param defaultValue Default value to return if parsing fails
 * @returns Parsed object or default value
 */
export function parseJsonSafe<T>(value: string | null | undefined, defaultValue: T): T {
  if (!value) return defaultValue;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return defaultValue;
  }
}

/**
 * Convert data to JSON string if it isn't already a string
 * @param data Data to stringify
 * @returns JSON string
 */
export function toJsonString(data: any): string | null {
  if (data === null || data === undefined) return null;
  if (typeof data === 'string') return data;
  try {
    return JSON.stringify(data);
  } catch (e) {
    console.error('Error converting to JSON string:', e);
    return null;
  }
}

/**
 * Parse JSON data from database
 * If it's already an object, return it directly
 * If it's a string, parse it
 * @param data Data from database
 * @returns Parsed object
 */
export function parseDbJson<T>(data: string | T): T {
  if (typeof data !== 'string') return data;
  try {
    return JSON.parse(data) as T;
  } catch (e) {
    console.error('Error parsing database JSON:', e);
    return {} as T;
  }
}
