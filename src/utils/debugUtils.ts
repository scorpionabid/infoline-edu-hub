/**
 * Debug utilities for UUID validation and database operations
 * Bu fayl debugging üçün köməkçi funksiyalar təmin edir
 */

export const logUUIDValidation = (
  value: any,
  context: string,
  result: string | null
) => {
  console.group(`🔍 UUID Validation - ${context}`);
  console.log('Original value:', value);
  console.log('Type:', typeof value);
  console.log('Result:', result);
  console.log('Valid:', result !== null);
  console.groupEnd();
};

export const logDatabaseOperation = (
  operation: string,
  data: any,
  result: { success: boolean; error?: string }
) => {
  console.group(`💾 Database Operation - ${operation}`);
  console.log('Data:', data);
  console.log('Success:', result.success);
  if (result.error) {
    console.error('Error:', result.error);
  }
  console.groupEnd();
};

export const logDataEntryFlow = (
  step: string,
  details: Record<string, any>
) => {
  console.log(`📝 Data Entry Flow - ${step}:`, details);
};
