
/**
 * Supabase PostgreSQL JSON compatible types
 * This helps ensure that types stored in JSON fields
 * are compatible with the database schema
 */

// Basic JSON value types
export type JsonPrimitive = string | number | boolean | null;
export type JsonObject = { [key: string]: Json };
export type JsonArray = Json[];

// Main JSON type for Supabase
export type Json = JsonPrimitive | JsonObject | JsonArray;

// Helper type to convert any type to a JSON-compatible type
export type JsonCompatible<T> = {
  [P in keyof T]: T[P] extends JsonPrimitive ? T[P] :
                  T[P] extends Array<infer U> ? JsonCompatible<U>[] :
                  T[P] extends object ? JsonCompatible<T[P]> : JsonPrimitive;
};

// Helper function to check if a value is a valid JSON
export function isValidJson(value: any): boolean {
  try {
    // Try to stringify and parse the value to check if it's valid JSON
    JSON.parse(JSON.stringify(value));
    return true;
  } catch (e) {
    return false;
  }
}

// Helper function to ensure any object conforms to JSON structure
export function ensureJson<T>(value: T): Json {
  return JSON.parse(JSON.stringify(value));
}
