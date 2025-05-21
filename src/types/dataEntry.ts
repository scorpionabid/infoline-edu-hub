
import {
  DataEntry,
  DataEntryRecord,
  DataEntryStatus,
  DataEntrySaveStatus,
  DataEntryForm,
  EntryValue,
  DataEntryTableData,
  ValidationResult,
  FormFieldsProps,
  FormFieldProps,
  DataEntrySaveBarProps
} from './core/dataEntry';

// Re-export core types
export {
  DataEntryStatus,
  DataEntrySaveStatus
};

export type {
  DataEntry,
  DataEntryRecord,
  DataEntryForm,
  EntryValue,
  DataEntryTableData,
  ValidationResult,
  FormFieldsProps,
  FormFieldProps,
  DataEntrySaveBarProps
};

// Additional UI-specific types
export interface TabDefinition {
  id: string;
  title: string;
  label?: string;
  columns?: any[];
  value?: string;
  count?: number;
}

export interface FormField {
  id: string;
  name: string;
  type: string;
  value: any;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: Array<{ id: string; label: string; value: string }>;
  validation?: Record<string, any>;
  onChange: (value: any) => void;
  onBlur?: () => void;
  error?: string;
}
