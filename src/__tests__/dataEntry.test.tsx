import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import DataEntryPage from '../pages/DataEntry';
import { LanguageProvider } from '../context/LanguageContext';
import { AuthProvider } from '../context/auth/AuthContext';

// React Router mock
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useSearchParams: () => [new URLSearchParams(), vi.fn()]
  };
});

// Test FormField component handling of disabled and readOnly props
describe('FormField props handling', () => {
  it('Should correctly handle disabled prop separately from readOnly', async () => {
    // Mock specific components to test prop handling
    const mockOnChange = vi.fn();
    
    // Setup test component
    render(
      <FormField
        name="testField"
        disabled={false}
        render={({ field }) => (
          <FieldRendererSimple
            type="text"
            value={field.value || ''}
            onChange={mockOnChange}
            disabled={false}
            readOnly={true}
            name="testField"
            id="testField"
          />
        )}
      />
    );
    
    // Find the field
    const inputField = screen.getByTestId('field-testField') as HTMLInputElement;
    
    // Should be readOnly but not disabled
    expect(inputField.readOnly).toBe(true);
    expect(inputField.disabled).toBe(false);
    
    // User should be able to focus the field (even if readOnly)
    inputField.focus();
    expect(document.activeElement).toBe(inputField);
  });
});

// Auth Context mock
vi.mock('../hooks/auth/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      role: 'schooladmin',
      schoolId: '123e4567-e89b-12d3-a456-426614174001'
    },
    isAuthenticated: true,
    isLoading: false,
    error: null
  })
}));

// Language Context mock
vi.mock('../context/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'az',
    changeLanguage: vi.fn(),
    t: (key: string) => key // Return the key as the translation
  }),
  LanguageProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

// Mock data hooks
vi.mock('../hooks/dataEntry/useDataEntry', () => ({
  useDataEntry: () => ({
    categories: [
      { id: 1, name: 'Tələbələr', description: 'Tələbə məlumatları' },
      { id: 2, name: 'Müəllimlər', description: 'Müəllim məlumatları' }
    ],
    columns: [
      { id: 1, name: 'Ad', type: 'text', required: true, categoryId: 1 },
      { id: 2, name: 'Soyad', type: 'text', required: true, categoryId: 1 },
      { id: 3, name: 'Yaş', type: 'number', required: false, categoryId: 1 }
    ],
    values: [],
    loading: false,
    error: null,
    saveData: vi.fn(),
    getCategories: vi.fn(),
    getColumns: vi.fn(),
    getValues: vi.fn()
  })
}));

// Mock services
vi.mock('../services/dataEntryService', () => ({
  getCategories: vi.fn().mockResolvedValue([
    { id: 1, name: 'Tələbələr', description: 'Tələbə məlumatları' },
    { id: 2, name: 'Müəllimlər', description: 'Müəllim məlumatları' }
  ]),
  getColumns: vi.fn().mockResolvedValue([
    { id: 1, name: 'Ad', type: 'text', required: true, categoryId: 1 },
    { id: 2, name: 'Soyad', type: 'text', required: true, categoryId: 1 },
    { id: 3, name: 'Yaş', type: 'number', required: false, categoryId: 1 }
  ]),
  saveData: vi.fn().mockResolvedValue({ success: true })
}));
describe('DataEntry Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

// Test FormField component handling of disabled and readOnly props
describe('FormField props handling', () => {
  it('Should correctly handle disabled prop separately from readOnly', async () => {
    // Mock specific components to test prop handling
    const mockOnChange = vi.fn();
    
    // Setup test component
    render(
      <FormField
        name="testField"
        disabled={false}
        render={({ field }) => (
          <FieldRendererSimple
            type="text"
            value={field.value || ''}
            onChange={mockOnChange}
            disabled={false}
            readOnly={true}
            name="testField"
            id="testField"
          />
        )}
      />
    );
    
    // Find the field
    const inputField = screen.getByTestId('field-testField') as HTMLInputElement;
    
    // Should be readOnly but not disabled
    expect(inputField.readOnly).toBe(true);
    expect(inputField.disabled).toBe(false);
    
    // User should be able to focus the field (even if readOnly)
    inputField.focus();
    expect(document.activeElement).toBe(inputField);
  });
});

  it('renders component in loading state', async () => {
    // Mock loading state
    vi.mock('../hooks/dataEntry/useDataEntry', () => ({
      useDataEntry: () => ({
        categories: [],
        columns: [],
        values: [],
        loading: true,
        error: null,
        saveData: vi.fn(),
        getCategories: vi.fn(),
        getColumns: vi.fn(),
        getValues: vi.fn()
      })
    }));
    
    render(
      <MemoryRouter>
        <AuthProvider>
          <LanguageProvider>
            <DataEntryPage />
          </LanguageProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Verify that the component renders even when loading
    await waitFor(() => {
      expect(screen.getByText('dataEntry')).toBeInTheDocument();
    });

// Test FormField component handling of disabled and readOnly props
describe('FormField props handling', () => {
  it('Should correctly handle disabled prop separately from readOnly', async () => {
    // Mock specific components to test prop handling
    const mockOnChange = vi.fn();
    
    // Setup test component
    render(
      <FormField
        name="testField"
        disabled={false}
        render={({ field }) => (
          <FieldRendererSimple
            type="text"
            value={field.value || ''}
            onChange={mockOnChange}
            disabled={false}
            readOnly={true}
            name="testField"
            id="testField"
          />
        )}
      />
    );
    
    // Find the field
    const inputField = screen.getByTestId('field-testField') as HTMLInputElement;
    
    // Should be readOnly but not disabled
    expect(inputField.readOnly).toBe(true);
    expect(inputField.disabled).toBe(false);
    
    // User should be able to focus the field (even if readOnly)
    inputField.focus();
    expect(document.activeElement).toBe(inputField);
  });
});
  });

// Test FormField component handling of disabled and readOnly props
describe('FormField props handling', () => {
  it('Should correctly handle disabled prop separately from readOnly', async () => {
    // Mock specific components to test prop handling
    const mockOnChange = vi.fn();
    
    // Setup test component
    render(
      <FormField
        name="testField"
        disabled={false}
        render={({ field }) => (
          <FieldRendererSimple
            type="text"
            value={field.value || ''}
            onChange={mockOnChange}
            disabled={false}
            readOnly={true}
            name="testField"
            id="testField"
          />
        )}
      />
    );
    
    // Find the field
    const inputField = screen.getByTestId('field-testField') as HTMLInputElement;
    
    // Should be readOnly but not disabled
      })
    }));
    
    // Setup component with readOnly mode
    render(
      <MemoryRouter>
        <AuthProvider>
          <LanguageProvider>
            <DataEntryPage />
          </LanguageProvider>
        </AuthProvider>
      </MemoryRouter>
    );
    
    await waitFor(() => screen.getByText('dataEntry'));
    
    // Find an input field
    const inputField = screen.getByPlaceholderText('enterValue') as HTMLInputElement;
    
    // Input field should be readOnly
    expect(inputField.readOnly).toBe(true);
    
    // Try to change the value
    fireEvent.change(inputField, { target: { value: 'New Value' } });
    
    // Value should not change
    expect(inputField.value).not.toBe('New Value');
  });
  
  // Test form interactivity in edit mode
  it('Should allow input when user has edit permissions', async () => {
    // Mock permissions to allow editing
    vi.mock('../hooks/auth/usePermissions', () => ({
      usePermissions: () => ({
        canEditData: true,
        hasSubmitPermission: true
      })
    }));
    
    // Setup component with edit permissions
    render(
      <MemoryRouter>
        <AuthProvider>
          <LanguageProvider>
            <DataEntryPage />
          </LanguageProvider>
        </AuthProvider>
      </MemoryRouter>
    );
    
    await waitFor(() => screen.getByText('dataEntry'));
    
    // Find an input field
    const inputField = screen.getByPlaceholderText('enterValue') as HTMLInputElement;
    
    // Input field should NOT be readOnly
    expect(inputField.readOnly).toBe(false);
    
    // Change the value
    fireEvent.change(inputField, { target: { value: 'New Test Value' } });
    
    // Value should change
    expect(inputField.value).toBe('New Test Value');
  });
  
  // Test form component props passing
  it('Should correctly pass readOnly and disabled props to form fields', async () => {
    // Create a test component with controlled props
    const TestComponent = ({ readOnly, disabled }: { readOnly: boolean, disabled: boolean }) => (
      <FormFields 
        columns={[
          { id: 'col1', name: 'Test Field', type: 'text', is_required: true }
        ]}
        readOnly={readOnly}
        disabled={disabled}
      />
    );
    
    // Render with different prop combinations
    const { rerender } = render(
      <MemoryRouter>
        <AuthProvider>
          <LanguageProvider>
            <TestComponent readOnly={false} disabled={false} />
          </LanguageProvider>
        </AuthProvider>
      </MemoryRouter>
    );
    
    // Get the input field
    const inputField = screen.getByTestId('field-col1') as HTMLInputElement;
    
    // In normal mode, both should be false
    expect(inputField.readOnly).toBe(false);
    expect(inputField.disabled).toBe(false);
    
    // Test with readOnly=true
    rerender(
    
    render(
      <MemoryRouter>
        <AuthProvider>
          <LanguageProvider>
            <DataEntryPage />
          </LanguageProvider>
        </AuthProvider>
      </MemoryRouter>
    );
    
    // Wait for all categories to render
    await waitFor(() => {
      expect(screen.getByText('dataEntry')).toBeInTheDocument();
    });

// Test FormField component handling of disabled and readOnly props
describe('FormField props handling', () => {
  it('Should correctly handle disabled prop separately from readOnly', async () => {
    // Mock specific components to test prop handling
    const mockOnChange = vi.fn();
    
    // Setup test component
    render(
      <FormField
        name="testField"
        disabled={false}
        render={({ field }) => (
          <FieldRendererSimple
            type="text"
            value={field.value || ''}
            onChange={mockOnChange}
            disabled={false}
            readOnly={true}
            name="testField"
            id="testField"
          />
        )}
      />
    );
    
    // Find the field
    const inputField = screen.getByTestId('field-testField') as HTMLInputElement;
    
    // Should be readOnly but not disabled
    expect(inputField.readOnly).toBe(true);
    expect(inputField.disabled).toBe(false);
    
    // User should be able to focus the field (even if readOnly)
    inputField.focus();
    expect(document.activeElement).toBe(inputField);
  });
});
    
    const end = performance.now();
    const renderTime = end - start;
    
    console.log(`Large dataset render time: ${renderTime}ms`);
    expect(renderTime).toBeLessThan(1500); // Should render within 1.5 seconds
  });

// Test FormField component handling of disabled and readOnly props
describe('FormField props handling', () => {
  it('Should correctly handle disabled prop separately from readOnly', async () => {
    // Mock specific components to test prop handling
    const mockOnChange = vi.fn();
    
    // Setup test component
    render(
      <FormField
        name="testField"
        disabled={false}
        render={({ field }) => (
          <FieldRendererSimple
            type="text"
            value={field.value || ''}
            onChange={mockOnChange}
            disabled={false}
            readOnly={true}
            name="testField"
            id="testField"
          />
        )}
      />
    );
    
    // Find the field
    const inputField = screen.getByTestId('field-testField') as HTMLInputElement;
    
    // Should be readOnly but not disabled
    expect(inputField.readOnly).toBe(true);
    expect(inputField.disabled).toBe(false);
    
    // User should be able to focus the field (even if readOnly)
    inputField.focus();
    expect(document.activeElement).toBe(inputField);
  });
});
});

// Test FormField component handling of disabled and readOnly props
describe('FormField props handling', () => {
  it('Should correctly handle disabled prop separately from readOnly', async () => {
    // Mock specific components to test prop handling
    const mockOnChange = vi.fn();
    
    // Setup test component
    render(
      <FormField
        name="testField"
        disabled={false}
        render={({ field }) => (
          <FieldRendererSimple
            type="text"
            value={field.value || ''}
            onChange={mockOnChange}
            disabled={false}
            readOnly={true}
            name="testField"
            id="testField"
          />
        )}
      />
    );
    
    // Find the field
    const inputField = screen.getByTestId('field-testField') as HTMLInputElement;
    
    // Should be readOnly but not disabled
    expect(inputField.readOnly).toBe(true);
    expect(inputField.disabled).toBe(false);
    
    // User should be able to focus the field (even if readOnly)
    inputField.focus();
    expect(document.activeElement).toBe(inputField);
  });
});