import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Categories from '@/pages/Categories';
import { mockUseCategoriesQuery, mockAuthStore, mockStorage } from './test-utils';
import { useCategoriesQuery } from '@/hooks/categories/useCategoriesQuery';
import { useAuthStore } from '@/hooks/auth/useAuthStore';

vi.mock('@/hooks/categories/useCategoriesQuery');
vi.mock('@/hooks/auth/useAuthStore');

describe('Category Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStore();
    mockStorage();

    (useAuthStore as any).mockReturnValue({
      user: { role: 'superadmin' },
      isAuthenticated: true
    });

    (useCategoriesQuery as any).mockReturnValue(mockUseCategoriesQuery());

    render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>
    );
  });

  it('should render the categories page', () => {
    expect(screen.getByText('Kateqoriyalar')).toBeInTheDocument();
    expect(screen.getByText('Kateqoriya əlavə et')).toBeInTheDocument();
  });

  it('should open the create category dialog', async () => {
    const addButton = screen.getByText('Kateqoriya əlavə et');
    await userEvent.click(addButton);
    expect(screen.getByText('Kateqoriya yarat')).toBeInTheDocument();
  });

  it('should call createCategory with form data', async () => {
    const createCategoryMock = vi.fn().mockResolvedValue({ id: 'new-category-id', name: 'Test Category' });
    
    // Mock the hook with proper return value
    const mockHook = {
      ...mockUseCategoriesQuery(),
      createCategory: createCategoryMock
    };
    
    (useCategoriesQuery as any).mockReturnValue(mockHook);

    const addButton = screen.getByText('Kateqoriya əlavə et');
    await userEvent.click(addButton);

    const nameInput = screen.getByLabelText('Ad');
    const descriptionInput = screen.getByLabelText('Açıqlama');
    const submitButton = screen.getByText('Yarat');

    await userEvent.type(nameInput, 'Test Category');
    await userEvent.type(descriptionInput, 'Test Description');
    
    await userEvent.click(submitButton);
    
    expect(createCategoryMock).toHaveBeenCalledWith({
      name: 'Test Category',
      description: 'Test Description'
    });
  });

  it('should call updateCategory with form data', async () => {
    const updateCategoryMock = vi.fn().mockResolvedValue({ id: 'category-1', name: 'Updated Category' });
    
    const mockHook = {
      ...mockUseCategoriesQuery(),
      updateCategory: updateCategoryMock
    };
    
    (useCategoriesQuery as any).mockReturnValue(mockHook);

    const editButton = screen.getAllByTestId('edit-category-button')[0];
    await userEvent.click(editButton);

    const nameInput = screen.getByLabelText('Ad');
    const descriptionInput = screen.getByLabelText('Açıqlama');
    const submitButton = screen.getByText('Yenilə');

    await userEvent.type(nameInput, 'Updated Category');
    await userEvent.type(descriptionInput, 'Updated Description');
    
    await userEvent.click(submitButton);
    
    expect(updateCategoryMock).toHaveBeenCalledWith('category-1', {
      name: 'Updated Category',
      description: 'Updated Description'
    });
  });

  it('should call deleteCategory with category id', async () => {
    const deleteCategoryMock = vi.fn().mockResolvedValue(true);
    
    const mockHook = {
      ...mockUseCategoriesQuery(),
      deleteCategory: deleteCategoryMock
    };
    
    (useCategoriesQuery as any).mockReturnValue(mockHook);

    const deleteButton = screen.getAllByTestId('delete-category-button')[0];
    await userEvent.click(deleteButton);

    const confirmButton = screen.getByText('Sil');
    await userEvent.click(confirmButton);
    
    expect(deleteCategoryMock).toHaveBeenCalledWith('category-1');
  });
});
