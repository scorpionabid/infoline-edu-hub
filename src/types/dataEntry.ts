
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

// Enhanced Status Permissions interface
export interface StatusPermissions {
  canEdit: boolean;
  canSubmit: boolean;
  canApprove: boolean;
  canReject: boolean;
  canReset: boolean;
  canView: boolean;
  readOnly: boolean;
  showEditControls: boolean;
  allowedActions: string[];
  alerts: {
    approval?: string;
    rejection?: string;
    warning?: string;
    info?: string;
  };
}

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
