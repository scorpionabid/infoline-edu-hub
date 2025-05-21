
/**
 * Core types for the application
 * All domain models should extend from these base types
 */

// Common properties for all entities
export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

// Status types that are shared across entities
export type Status = 'active' | 'inactive' | 'archived' | 'draft' | 'pending' | 'approved' | 'rejected';

// JSON utility type to help with Supabase JSON fields
export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
export interface JsonObject { [key: string]: JsonValue }
export type JsonArray = JsonValue[];

// Type guard to check if a value is a valid JSON object
export function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Type guard to check if a value is a valid JSON array
export function isJsonArray(value: unknown): value is JsonArray {
  return Array.isArray(value);
}

// Function to safely parse JSON with type inference
export function parseJson<T>(value: string | null | undefined, defaultValue: T): T {
  if (!value) return defaultValue;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return defaultValue;
  }
}
