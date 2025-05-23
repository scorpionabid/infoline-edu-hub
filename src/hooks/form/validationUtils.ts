// This is just a helper file to define types and utilities for validation
import { ColumnValidationError } from '@/types/dataEntry';

export type ValidationResult = {
  valid: boolean;
  errors: ColumnValidationError[];
};

export const validateRequired = (value: any, columnId: string, columnName: string): ColumnValidationError | null => {
  if (value === undefined || value === null || value === '') {
    return {
      columnId,
      columnName,
      message: `${columnName} is required`,
      severity: 'error'
    };
  }
  return null;
};

export const validateMinMax = (
  value: number,
  min: number | undefined,
  max: number | undefined,
  columnId: string,
  columnName: string
): ColumnValidationError | null => {
  if (min !== undefined && value < min) {
    return {
      columnId,
      columnName,
      message: `${columnName} must be at least ${min}`,
      severity: 'error'
    };
  }
  if (max !== undefined && value > max) {
    return {
      columnId,
      columnName,
      message: `${columnName} must be at most ${max}`,
      severity: 'error'
    };
  }
  return null;
};

export default {
  validateRequired,
  validateMinMax
};
