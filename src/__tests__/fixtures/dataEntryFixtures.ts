// Test ediləcək komponentlər üçün ümumi test məlumatları

export const mockCategory = {
  id: 'test-category',
  name: 'Test Category',
  description: 'Test description',
  assignment: 'all' as const,
  status: 'active' as const,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  columns: [
    {
      id: 'text-field',
      name: 'Text Field',
      type: 'text' as const,
      is_required: true,
      placeholder: 'Enter text',
      help_text: 'This is a text field'
    },
    {
      id: 'number-field',
      name: 'Number Field',
      type: 'number' as const,
      is_required: false,
      placeholder: 'Enter number',
      validation: {
        min: 0,
        max: 100
      }
    },
    {
      id: 'select-field',
      name: 'Select Field',
      type: 'select' as const,
      is_required: true,
      placeholder: 'Choose option',
      options: [
        { label: 'Option 1', value: 'opt1' },
        { label: 'Option 2', value: 'opt2' }
      ]
    }
  ]
};

export const mockUser = {
  id: 'test-user-id',
  school_id: 'test-school-id',
  email: 'test@example.com'
};

export const mockDataEntryManager = {
  categories: [mockCategory],
  loading: false,
  error: null,
  refetch: () => {},
  formData: {},
  isLoading: false,
  isSubmitting: false,
  isSaving: false,
  isDataModified: false,
  entryStatus: 'draft',
  lastSaved: null,
  autoSaveState: {
    isEnabled: true,
    interval: 3000,
    lastSave: null,
    pendingChanges: false,
    error: null,
    attempts: 0
  },
  handleFormDataChange: () => {},
  handleFieldChange: () => {},
  handleSubmit: () => {},
  handleSave: () => {},
  resetForm: () => {},
  loadData: () => {}
};
