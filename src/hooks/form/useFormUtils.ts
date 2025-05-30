// Define missing interfaces locally if they're not available from the types
export interface CategoryEntryData {
  id: string;
  columnId: string;
  value: string;
  status: string;
}

export interface CategoryWithEntries {
  id: string;
  name: string;
  description?: string;
  status?: string;
  deadline?: string;
  completionRate: number;
  entries?: CategoryEntryData[];
}

// Extend DataEntryForm to include isModified property
export interface DataEntryForm {
  categoryId: string;
  entries: Record<string, string>;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  isModified?: boolean;
}

export function initializeForm(categoryId: string, initialEntries?: CategoryEntryData[]): DataEntryForm {
  const entries: Record<string, string> = {};
  
  if (initialEntries && initialEntries.length > 0) {
    initialEntries.forEach(entry => {
      entries[entry.columnId] = entry.value;
    });
  }
  
  return {
    categoryId,
    entries,
    status: 'draft',
    isModified: false
  };
}

export function validateForm(form: DataEntryForm, requiredFields: string[]): boolean {
  if (!form.categoryId) return false;
  
  for (const fieldId of requiredFields) {
    if (!form.entries[fieldId] || form.entries[fieldId].trim() === '') {
      return false;
    }
  }
  
  return true;
}

export function preprocessFormData(form: DataEntryForm): CategoryEntryData[] {
  const result: CategoryEntryData[] = [];
  
  for (const [columnId, value] of Object.entries(form.entries)) {
    result.push({
      id: '', // Backend-də generasiya ediləcək
      columnId,
      value,
      status: form.status
    });
  }
  
  return result;
}

export default {
  initializeForm,
  validateForm,
  preprocessFormData
};
