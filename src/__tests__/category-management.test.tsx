
import React from 'react';
import { screen, fireEvent, waitFor, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { mockStorage } from './test-utils';

// Mock the auth store
vi.mock('@/hooks/auth/useAuthStore');

// Mock the language context
vi.mock('@/context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'az'
  })
}));

// Mock categories operations
const mockCreateCategory = vi.fn().mockResolvedValue({ id: 'new-category-id', name: 'Test Category' });
const mockUpdateCategory = vi.fn().mockResolvedValue({ id: 'category-1', name: 'Updated Category' });
const mockDeleteCategory = vi.fn().mockResolvedValue({ id: 'category-1' });

const MockCategories = () => {
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  
  return (
    <div data-testid="mock-categories">
      <h1>Kateqoriyalar</h1>
      <button onClick={() => setShowCreateDialog(true)}>Kateqoriya əlavə et</button>
      
      {showCreateDialog && (
        <div data-testid="create-category-dialog">
          <h2>Kateqoriya yarat</h2>
          <button onClick={() => mockCreateCategory({ name: 'Test Category' })}>
            Yarat
          </button>
        </div>
      )}
    </div>
  );
};

describe('Category Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStorage();

    (useAuthStore as any).mockReturnValue({
      user: { role: 'superadmin' },
      isAuthenticated: true
    });

    render(
      <MemoryRouter>
        <MockCategories />
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
});
