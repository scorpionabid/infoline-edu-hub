import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import SchoolAdminDataEntry from '@/components/dataEntry/SchoolAdminDataEntry';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { useDataEntryManager } from '@/hooks/dataEntry/useDataEntryManager';

// Mock hooks
vi.mock('@/hooks/auth/useAuthStore');
vi.mock('@/hooks/dataEntry/useDataEntryManager');
vi.mock('@/contexts/TranslationContext', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

const mockUseAuthStore = vi.mocked(useAuthStore);
const mockUseDataEntryManager = vi.mocked(useDataEntryManager);

describe('SchoolAdminDataEntry', () => {
  const mockUser = {
    id: 'test-user-id',
    school_id: 'test-school-id',
    email: 'test@example.com'
  };

  const mockCategories = [
    {
      id: 'cat-1',
      name: 'Test Category',
      description: 'Test Description',
      assignment: 'all' as const,
      columns: [
        {
          id: 'col-1',
          name: 'Test Column',
          type: 'text' as const,
          is_required: true,
          placeholder: 'Enter text',
          help_text: 'Help text'
        }
      ]
    }
  ];

  beforeEach(() => {
    mockUseAuthStore.mockReturnValue(mockUser);
    mockUseDataEntryManager.mockReturnValue({
      categories: mockCategories,
      loading: false,
      error: null,
      refetch: vi.fn(),
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
      handleFormDataChange: vi.fn(),
      handleFieldChange: vi.fn(),
      handleSubmit: vi.fn(),
      handleSave: vi.fn(),
      resetForm: vi.fn(),
      loadData: vi.fn()
    });
  });

  it('renders without crashing', () => {
    render(<SchoolAdminDataEntry />);
    expect(screen.getByText('Məlumat Daxil Etmə')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseDataEntryManager.mockReturnValue({
      ...mockUseDataEntryManager(),
      loading: true
    });

    render(<SchoolAdminDataEntry />);
    expect(screen.getByText('Məlumatlar yüklənir...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    mockUseDataEntryManager.mockReturnValue({
      ...mockUseDataEntryManager(),
      loading: false,
      error: 'Test error message'
    });

    render(<SchoolAdminDataEntry />);
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('shows no school assigned error', () => {
    mockUseAuthStore.mockReturnValue({
      ...mockUser,
      school_id: undefined,
      schoolId: undefined
    });

    render(<SchoolAdminDataEntry />);
    expect(screen.getByText(/Sizə hələ məktəb təyin edilməyib/)).toBeInTheDocument();
  });

  it('displays categories in selection mode', () => {
    render(<SchoolAdminDataEntry />);
    expect(screen.getByText('Test Category')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('allows category selection', () => {
    render(<SchoolAdminDataEntry />);
    
    const categoryCard = screen.getByText('Test Category').closest('div');
    expect(categoryCard).toBeInTheDocument();
    
    fireEvent.click(categoryCard!);
    
    // Should navigate to data entry mode
    expect(screen.getByText('Kateqoriyalara qayıt')).toBeInTheDocument();
  });
});

describe('SchoolAdminDataEntry - Microsoft Forms Style', () => {
  it('shows progress overview', () => {
    render(<SchoolAdminDataEntry />);
    expect(screen.getByText('Ümumi Progress')).toBeInTheDocument();
  });

  it('displays completion statistics', () => {
    render(<SchoolAdminDataEntry />);
    expect(screen.getByText('Toplam')).toBeInTheDocument();
    expect(screen.getByText('Tamamlandı')).toBeInTheDocument();
    expect(screen.getByText('Qalıb')).toBeInTheDocument();
  });

  it('shows auto-save indicator', () => {
    mockUseDataEntryManager.mockReturnValue({
      ...mockUseDataEntryManager(),
      isDataModified: true,
      autoSaveState: {
        isEnabled: true,
        interval: 3000,
        lastSave: null,
        pendingChanges: true,
        error: null,
        attempts: 0
      }
    });

    render(<SchoolAdminDataEntry />);
    
    // Click on a category to enter data entry mode
    const categoryCard = screen.getByText('Test Category').closest('div');
    fireEvent.click(categoryCard!);
    
    expect(screen.getByText('Auto-save aktiv')).toBeInTheDocument();
  });
});