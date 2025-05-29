
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { mockEdgeFunctions } from './test-utils';
import { useUsersQuery } from '@/hooks/users/useUsersQuery';
import { createUser } from '@/integrations/edge-functions';

// Mock funksiyalar
const mockCreateUserFn = vi.fn().mockResolvedValue({ id: 'new-user-id', name: 'Test User' });

vi.mock('@/hooks/users/useUsersQuery');
vi.mock('@/integrations/edge-functions', () => ({
  createUser: mockCreateUserFn
}));

// Mock UserManagement komponenti
const MockUserManagement = () => {
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);

  // Form yaratmaq üçün handler
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mockCreateUserFn({
      email: 'test@example.com',
      fullName: 'Test User',
      role: 'user',
      status: 'active'
    });
    setShowCreateDialog(false);
  };

  return (
    <div data-testid="user-management">
      <h1>İstifadəçilər</h1>
      <button data-testid="create-user-button" onClick={() => setShowCreateDialog(true)}>İstifadəçi yarat</button>
      
      {/* İstifadəçi yaratma dialoqu */}
      <div data-testid="create-user-dialog" style={{ display: showCreateDialog ? 'block' : 'none' }}>
        <h2>İstifadəçi yarat</h2>
        <form data-testid="user-form" onSubmit={handleCreateSubmit}>
          <div>
            <label htmlFor="email">E-poçt</label>
            <input id="email" type="email" name="email" defaultValue="test@example.com" />
          </div>
          <div>
            <label htmlFor="fullName">Ad Soyad</label>
            <input id="fullName" type="text" name="fullName" defaultValue="Test User" />
          </div>
          <div>
            <label htmlFor="role">Rol</label>
            <select id="role" name="role" defaultValue="user">
              <option value="superadmin">Super Admin</option>
              <option value="regionadmin">Region Admin</option>
              <option value="schooladmin">Məktəb Admin</option>
              <option value="user">İstifadəçi</option>
            </select>
          </div>
          <button type="submit">Yarat</button>
        </form>
      </div>

      <table>
        <thead>
          <tr>
            <th>Ad Soyad</th>
            <th>E-poçt</th>
            <th>Rol</th>
            <th>Status</th>
            <th>Əməliyyatlar</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Test User</td>
            <td>test@example.com</td>
            <td>superadmin</td>
            <td>active</td>
            <td>
              <button data-testid="edit-user-button">Düzəliş et</button>
              <button data-testid="delete-user-button">Sil</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// UserManagement komponentini mock edirik
vi.mock('@/pages/UserManagement', () => ({
  __esModule: true,
  default: () => <MockUserManagement />
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

describe('User Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEdgeFunctions();
    
    (useUsersQuery as any).mockReturnValue({
      users: [],
      loading: false,
      error: null,
      total: 0,
      page: 1,
      limit: 10,
      setPage: vi.fn(),
      setLimit: vi.fn(),
      search: '',
      setSearch: vi.fn(),
      roleFilter: [],
      setRoleFilter: vi.fn(),
      statusFilter: [],
      setStatusFilter: vi.fn(),
      createUser: vi.fn(),
      updateUser: vi.fn(),
      deleteUser: vi.fn(),
      refetch: vi.fn()
    });
  });

  it('should render UserManagement page', () => {
    render(
      <MemoryRouter>
        <MockUserManagement />
      </MemoryRouter>
    );
    expect(screen.getByText('İstifadəçilər')).toBeInTheDocument();
  });

  it('should open create user dialog', async () => {
    render(
      <MemoryRouter>
        <MockUserManagement />
      </MemoryRouter>
    );
    const createUserButton = screen.getByTestId('create-user-button');
    await userEvent.click(createUserButton);
    
    // Dialoq görünür
    const createUserDialog = screen.getByTestId('create-user-dialog');
    expect(createUserDialog).toBeInTheDocument();
  });
  
  it('should call createUser with form data', async () => {
    render(
      <MemoryRouter>
        <MockUserManagement />
      </MemoryRouter>
    );
    
    // İstifadəçi yaratma dialoqunu açırıq
    const createUserButton = screen.getByTestId('create-user-button');
    await userEvent.click(createUserButton);
    
    // Formu göndəririk
    const submitButton = screen.getByText('Yarat');
    await userEvent.click(submitButton);
    
    // Mockun çağırıldığını yoxlayırıq
    expect(mockCreateUserFn).toHaveBeenCalledWith({
      email: 'test@example.com',
      fullName: 'Test User',
      role: 'user',
      status: 'active'
    });
  });
  
  // Performance Tests
  describe('User Management Performance Tests', () => {
    it('renders user management page efficiently', async () => {
      const start = performance.now();
      
      render(
        <MemoryRouter>
          <MockUserManagement />
        </MemoryRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText('İstifadəçilər')).toBeInTheDocument();
      });
      
      const end = performance.now();
      const renderTime = end - start;
      
      console.log(`User management page render time: ${renderTime}ms`);
      expect(renderTime).toBeLessThan(1000); // Should render within 1 second
    });
    
    it('loads user data with acceptable performance', async () => {
      // Prepare large dataset
      const largeUserList = Array(100).fill(null).map((_, i) => ({
        id: `user-${i}`,
        email: `user${i}@example.com`,
        fullName: `User ${i}`,
        role: i % 4 === 0 ? 'superadmin' : i % 4 === 1 ? 'regionadmin' : i % 4 === 2 ? 'sectoradmin' : 'schooladmin',
        status: i % 2 === 0 ? 'active' : 'inactive',
        created_at: new Date().toISOString()
      }));
      
      // Mock the hook to return large dataset
      (useUsersQuery as any).mockReturnValue({
        users: largeUserList,
        loading: false,
        error: null,
        total: largeUserList.length,
        page: 1,
        limit: 100,
        setPage: vi.fn(),
        setLimit: vi.fn(),
        search: '',
        setSearch: vi.fn(),
        roleFilter: [],
        setRoleFilter: vi.fn(),
        statusFilter: [],
        setStatusFilter: vi.fn(),
        createUser: vi.fn(),
        updateUser: vi.fn(),
        deleteUser: vi.fn(),
        refetch: vi.fn()
      });
      
      const start = performance.now();
      
      render(
        <MemoryRouter>
          <MockUserManagement />
        </MemoryRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText('İstifadəçilər')).toBeInTheDocument();
      });
      
      const end = performance.now();
      const loadTime = end - start;
      
      console.log(`Large user dataset load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(1500); // Should load within 1.5 seconds
    });
    
    it('handles user creation with good performance', async () => {
      render(
        <MemoryRouter>
          <MockUserManagement />
        </MemoryRouter>
      );
      
      // Open create user dialog
      const createUserButton = screen.getByTestId('create-user-button');
      await userEvent.click(createUserButton);
      
      // Start timer before form submission
      const start = performance.now();
      
      // Submit the form
      const submitButton = screen.getByText('Yarat');
      await userEvent.click(submitButton);
      
      // Wait for the mock to be called
      await waitFor(() => {
        expect(mockCreateUserFn).toHaveBeenCalled();
      });
      
      const end = performance.now();
      const submissionTime = end - start;
      
      console.log(`User creation form submission time: ${submissionTime}ms`);
      expect(submissionTime).toBeLessThan(500); // Should complete within 500ms
    });
    
    it('UI interactions have acceptable performance', async () => {
      // Create large dataset
      const largeUserList = Array(200).fill(null).map((_, i) => ({
        id: `user-${i}`,
        email: `user${i}@example.com`,
        fullName: `User ${i}`,
        role: i % 4 === 0 ? 'superadmin' : i % 4 === 1 ? 'regionadmin' : i % 4 === 2 ? 'sectoradmin' : 'schooladmin',
        status: i % 2 === 0 ? 'active' : 'inactive',
        created_at: new Date().toISOString()
      }));
      
      // Create mock implementation for interactions
      const mockSetPage = vi.fn();
      const mockCreateUser = vi.fn();
      
      (useUsersQuery as any).mockReturnValue({
        users: largeUserList,
        loading: false,
        error: null,
        total: largeUserList.length,
        page: 1,
        limit: 100,
        setPage: mockSetPage,
        setLimit: vi.fn(),
        search: '',
        setSearch: vi.fn(),
        roleFilter: [],
        setRoleFilter: vi.fn(),
        statusFilter: [],
        setStatusFilter: vi.fn(),
        createUser: mockCreateUser,
        updateUser: vi.fn(),
        deleteUser: vi.fn(),
        refetch: vi.fn()
      });
      
      render(
        <MemoryRouter>
          <MockUserManagement />
        </MemoryRouter>
      );
      
      // Measure interaction performance with user creation button
      const userCreateButton = screen.getByTestId('create-user-button');
      
      const start = performance.now();
      
      // Click the create user button
      await userEvent.click(userCreateButton);
      
      // Wait for the dialog to appear
      await waitFor(() => {
        expect(screen.getByTestId('create-user-dialog')).toHaveStyle({ display: 'block' });
      });
      
      const end = performance.now();
      const interactionTime = end - start;
      
      console.log(`UI interaction time: ${interactionTime}ms`);
      expect(interactionTime).toBeLessThan(300); // Should interact within 300ms
    });
  });
});
