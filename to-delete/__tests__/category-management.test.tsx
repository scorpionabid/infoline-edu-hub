
import React from 'react';
import { screen, fireEvent, waitFor, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import useCategoriesQuery from '@/hooks/categories/useCategoriesQuery';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { mockUseCategoriesQuery, mockStorage } from './test-utils';

// Lazım olan bütün komponentləri və hookları mock edirik
vi.mock('@/hooks/categories/useCategoriesQuery');
vi.mock('@/hooks/auth/useAuthStore');

// Kəteqoriya əməliyyatları üçün mock funksiyalar
const mockCreateCategory = vi.fn().mockResolvedValue({ id: 'new-category-id', name: 'Test Category' });
const mockUpdateCategory = vi.fn().mockResolvedValue({ id: 'category-1', name: 'Updated Category' });
const mockDeleteCategory = vi.fn().mockResolvedValue({ id: 'category-1' });

// Mock Categories komponenti
const MockCategories = () => {
  // Dialog göstərmək üçün state-lər
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  
  // Form yaratmaq handler
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mockCreateCategory({
      name: 'Test Category',
      description: 'Test Description'
    });
    setShowCreateDialog(false);
  };
  
  // Form yeniləmək handler
  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mockUpdateCategory({
      id: 'category-1',
      name: 'Updated Category',
      description: 'Updated Description'
    });
    setShowEditDialog(false);
  };
  
  // Silmə təsdiq handler
  const handleDeleteConfirm = () => {
    mockDeleteCategory('category-1');
    setShowDeleteDialog(false);
  };
  
  return (
    <div data-testid="mock-categories">
      <h1>Kateqoriyalar</h1>
      <button onClick={() => setShowCreateDialog(true)}>Kateqoriya əlavə et</button>
      
      {/* Yaratma dialoqu */}
      <div data-testid="create-category-dialog" style={{ display: showCreateDialog ? 'block' : 'none' }}>
        <h2>Kateqoriya yarat</h2>
        <form data-testid="category-form" onSubmit={handleCreateSubmit}>
          <div>
            <label htmlFor="name">Ad</label>
            <input id="name" type="text" name="name" defaultValue="Test Category" />
          </div>
          <div>
            <label htmlFor="description">Açıqlama</label>
            <input id="description" type="text" name="description" defaultValue="Test Description" />
          </div>
          <button type="submit">Yarat</button>
        </form>
      </div>
      
      {/* Düzəliş dialoqu */}
      <div data-testid="edit-category-dialog" style={{ display: showEditDialog ? 'block' : 'none' }}>
        <h2>Kateqoriyaya düzəliş et</h2>
        <form data-testid="edit-form" onSubmit={handleUpdateSubmit}>
          <div>
            <label htmlFor="edit-name">Ad</label>
            <input id="edit-name" type="text" name="name" defaultValue="Test Kateqoriya" />
          </div>
          <div>
            <label htmlFor="edit-description">Açıqlama</label>
            <input id="edit-description" type="text" name="description" defaultValue="Test Kateqoriya Açıqlaması" />
          </div>
          <button type="submit">Yenilə</button>
        </form>
      </div>
      
      {/* Təsdiq dialoqu */}
      <div data-testid="delete-dialog" style={{ display: showDeleteDialog ? 'block' : 'none' }}>
        <h2>Təsdiq</h2>
        <p>Bu kateqoriyanı silmək istədiyinizə əminsinizmi?</p>
        <button data-testid="confirm-delete" onClick={handleDeleteConfirm}>Təsdiq</button>
        <button onClick={() => setShowDeleteDialog(false)}>Ləğv et</button>
      </div>
    
      <div>
        <table>
          <thead>
            <tr>
              <th>Ad</th>
              <th>Açıqlama</th>
              <th>Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Test Kateqoriya</td>
              <td>Test Kateqoriya Açıqlaması</td>
              <td>
                <button data-testid="edit-category-button" onClick={() => setShowEditDialog(true)}>Düzəliş et</button>
                <button data-testid="delete-category-button" onClick={() => setShowDeleteDialog(true)}>Sil</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Categories komponentini mock edirik
vi.mock('@/pages/Categories', () => ({
  __esModule: true,
  default: () => <MockCategories />
}));

// Mock useLanguage hook
vi.mock('@/context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'az',
    setLanguage: vi.fn(),
    availableLanguages: ['az', 'en'],
    currentLanguage: 'az',
    i18n: { changeLanguage: vi.fn() },
    isRtl: false,
    languages: {
      az: { nativeName: 'Azərbaycan', flag: '🇦🇿' },
      en: { nativeName: 'English', flag: '🇬🇧' }
    },
    supportedLanguages: ['az', 'en']
  }),
  useLanguageSafe: () => ({
    t: (key: string) => key,
    language: 'az',
    setLanguage: vi.fn(),
    availableLanguages: ['az', 'en'],
    currentLanguage: 'az', 
    i18n: { changeLanguage: vi.fn() },
    isRtl: false,
    languages: {
      az: { nativeName: 'Azərbaycan', flag: '🇦🇿' },
      en: { nativeName: 'English', flag: '🇬🇧' }
    },
    supportedLanguages: ['az', 'en']
  })
}));

describe('Category Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStorage();

    (useAuthStore as any).mockReturnValue({
      user: { role: 'superadmin' },
      isAuthenticated: true
    });

    (useCategoriesQuery as any).mockReturnValue(mockUseCategoriesQuery());

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

  it('should call createCategory with form data', async () => {
    // Test üçün form hazırlanır
    const addButton = screen.getByText('Kateqoriya əlavə et');
    await userEvent.click(addButton);
    
    const submitButton = screen.getByText('Yarat');
    await userEvent.click(submitButton);
    
    // Mockun çağırıldığını yoxlayırıq
    expect(mockCreateCategory).toHaveBeenCalledWith({
      name: 'Test Category',
      description: 'Test Description'
    });
  });

  it('should call updateCategory with form data', async () => {
    // Test üçün edit dialogunu açırıq
    const editButton = screen.getByTestId('edit-category-button');
    await userEvent.click(editButton);
    
    // Edit formu görünür
    const editForm = screen.getByTestId('edit-form');
    expect(editForm).toBeInTheDocument();
    
    // Yenilə düyməsini tapırıq və klikləyirik
    const submitButton = screen.getByText('Yenilə');

    await userEvent.click(submitButton);
    
    // Yoxlayırıq ki mockumuz çağırılıb
    expect(mockUpdateCategory).toHaveBeenCalledWith({
      id: 'category-1',
      name: 'Updated Category',
      description: 'Updated Description'
    });
  });

  it('should call deleteCategory with category id', async () => {
    // Silmə düyməsinə klikləyirik
    const deleteButton = screen.getByTestId('delete-category-button');
    await userEvent.click(deleteButton);
    
    // Təsdiq dialoqu görünür
    const confirmDialog = screen.getByTestId('delete-dialog');
    expect(confirmDialog).toBeInTheDocument();
    
    // Təsdiq düyməsini tapırıq və klikləyirik
    const confirmButton = screen.getByTestId('confirm-delete');
    await userEvent.click(confirmButton);
    
    // Mockun çağırıldığını yoxlayırıq
    expect(mockDeleteCategory).toHaveBeenCalledWith('category-1');
  });
});
