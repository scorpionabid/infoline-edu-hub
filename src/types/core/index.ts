
/**
 * Core type definitions shared across the application
 */

// Base entity with common properties for all database entities
export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
}

// Generic JsonValue type
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

// Generic response format for API calls
export interface ApiResponse<T> {
  data?: T;
  error?: string | Error;
  status: number;
  message?: string;
}
