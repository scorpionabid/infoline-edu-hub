import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CategoryColumn from '@/components/columns/CategoryColumn';
import { useCategoryData } from '@/hooks/useCategoryData';
import { useColumnStore } from '@/store/columnStore';
import { useForm } from 'react-hook-form';
import { ColumnType } from '@/types/column';
import { Category } from '@/types/category';
import { useTranslation } from '@/contexts/TranslationContext';

// Mock the useCategoryData hook
vi.mock('@/hooks/useCategoryData', () => ({
  useCategoryData: vi.fn()
}));

// Mock the column store
vi.mock('@/store/columnStore', () => ({
  useColumnStore: vi.fn()
}));

// Mock the translation context
vi.mock('@/contexts/TranslationContext', () => ({
  useTranslation: vi.fn(() => ({
    t: (key: string) => key,
    language: 'az',
    setLanguage: vi.fn(),
    isLoading: false,
    error: null,
    isReady: true
  }))
}));

describe('CategoryColumn Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with category options', async () => {
    const mockCategories: Category[] = [
      { id: '1', name: 'Category 1' },
      { id: '2', name: 'Category 2' }
    ];

    (useCategoryData as any).mockReturnValue({
      category: { id: '1', name: 'Category 1' },
      isLoading: false,
      error: null
    });

    (useColumnStore as any).mockReturnValue({
      categories: mockCategories,
      addColumn: vi.fn(),
      updateColumn: vi.fn(),
      deleteColumn: vi.fn(),
      columns: [],
      selectedColumnType: ColumnType.TEXT,
      setSelectedColumnType: vi.fn()
    });

    const { result } = render(
      <CategoryColumn
        form={useForm()}
        control={{}}
        categories={mockCategories}
        editColumn={null}
        selectedType={ColumnType.CATEGORY}
        onTypeChange={vi.fn()}
        isEditMode={false}
      />
    );

    expect(screen.getByText('Category 1')).toBeInTheDocument();
    expect(screen.getByText('Category 2')).toBeInTheDocument();
  });

  it('handles category change correctly', async () => {
    const mockCategories: Category[] = [
      { id: '1', name: 'Category 1' },
      { id: '2', name: 'Category 2' }
    ];

    const mockUseCategoryData = vi.fn();
    (useCategoryData as any).mockImplementation(mockUseCategoryData);

    (useColumnStore as any).mockReturnValue({
      categories: mockCategories,
      addColumn: vi.fn(),
      updateColumn: vi.fn(),
      deleteColumn: vi.fn(),
      columns: [],
      selectedColumnType: ColumnType.TEXT,
      setSelectedColumnType: vi.fn()
    });

    render(
      <CategoryColumn
        form={useForm()}
        control={{}}
        categories={mockCategories}
        editColumn={null}
        selectedType={ColumnType.CATEGORY}
        onTypeChange={vi.fn()}
        isEditMode={false}
      />
    );

    const categorySelect = screen.getByRole('combobox');
    fireEvent.change(categorySelect, { target: { value: '2' } });

    // Wait for the category to be updated
    await waitFor(() => {
      expect(mockUseCategoryData).toHaveBeenCalled();
    });
  });
});
