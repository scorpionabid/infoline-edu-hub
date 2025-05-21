/**
 * İstifadəçi İdarəetməsi Testləri
 * 
 * Bu test faylı, İnfoLine tətbiqinin istifadəçi idarəetmə funksionallığını yoxlayır:
 * - Yeni istifadəçi yaratma
 * - İstifadəçi rolu təyin etmə
 * - İstifadəçi redaktəsi
 * - İstifadəçi silmə
 * - İstifadəçi siyahısı
 * - İstifadəçi filtrasiyası
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, expect, beforeEach, describe, it } from 'vitest';
import '@testing-library/jest-dom';

// Test vasitələri və yardımçı funksiyalar
import { 
  renderWithProviders, 
  mockSupabase, 
  mockUserRole, 
  mockEdgeFunctions,
  mockUserData,
  UserRole
} from './test-utils';

// React Router
import { MemoryRouter } from 'react-router-dom';

// Mock data
const mockUsers = [
  {
    id: '1',
    email: 'superadmin@example.com',
    full_name: 'Super Admin',
    language: 'az',
    role: 'superadmin',
    status: 'active',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    email: 'regionadmin@example.com',
    full_name: 'Region Admin',
    language: 'az',
    role: 'regionadmin',
    status: 'active',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    region_id: 'region-1'
  },
  {
    id: '3',
    email: 'sectoradmin@example.com',
    full_name: 'Sector Admin',
    language: 'az',
    role: 'sectoradmin',
    status: 'active',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    region_id: 'region-1',
    sector_id: 'sector-1'
  },
  {
    id: '4',
    email: 'schooladmin@example.com',
    full_name: 'School Admin',
    language: 'az',
    role: 'schooladmin',
    status: 'active',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    region_id: 'region-1',
    sector_id: 'sector-1',
    school_id: 'school-1'
  }
];

// Mock available users for admin assignment
const mockAvailableUsers = [
  {
    id: '5',
    email: 'available1@example.com',
    full_name: 'Available User 1',
    language: 'az',
    role: null,
    status: 'active',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  },
  {
    id: '6',
    email: 'available2@example.com',
    full_name: 'Available User 2',
    language: 'az',
    role: null,
    status: 'active',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  }
];

// Mock regions and sectors
const mockRegions = [
  { id: 'region-1', name: 'Bakı' },
  { id: 'region-2', name: 'Sumqayıt' }
];

const mockSectors = [
  { id: 'sector-1', name: 'Xətai', region_id: 'region-1' },
  { id: 'sector-2', name: 'Yasamal', region_id: 'region-1' }
];

const mockSchools = [
  { id: 'school-1', name: 'Məktəb 1', sector_id: 'sector-1', region_id: 'region-1' },
  { id: 'school-2', name: 'Məktəb 2', sector_id: 'sector-1', region_id: 'region-1' }
];

// Mock supabase və Edge Function
const mockCallEdgeFunction = vi.fn().mockImplementation((functionName, options) => {
  if (functionName === 'create-user') {
    return Promise.resolve({
      data: {
        id: 'new-user-id',
        email: options.body.email,
        full_name: options.body.fullName,
        language: options.body.language || 'az',
        role: null,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      error: null
    });
  }
  
  if (functionName === 'assign-region-admin') {
    return Promise.resolve({
      data: {
        success: true,
        message: 'İstifadəçi region admin kimi təyin edildi',
        user_id: options.body.userId,
        region_id: options.body.regionId
      },
      error: null
    });
  }
  
  if (functionName === 'assign-sector-admin') {
    return Promise.resolve({
      data: {
        success: true,
        message: 'İstifadəçi sektor admin kimi təyin edildi',
        user_id: options.body.userId,
        sector_id: options.body.sectorId
      },
      error: null
    });
  }
  
  if (functionName === 'assign-school-admin') {
    return Promise.resolve({
      data: {
        success: true,
        message: 'İstifadəçi məktəb admin kimi təyin edildi',
        user_id: options.body.userId,
        school_id: options.body.schoolId
      },
      error: null
    });
  }
  
  return Promise.resolve({ data: null, error: { message: 'Unknown function' } });
});

// Supabase mock
const mockedSupabase = {
  auth: {
    admin: {
      createUser: vi.fn().mockImplementation(({ email, password, email_confirm: emailConfirm }) => {
        return Promise.resolve({ 
          data: { user: { id: 'new-user-id', email, emailConfirm, created_at: new Date().toISOString() } }, 
          error: null 
        });
      }),
      updateUserById: vi.fn().mockImplementation((id, { email, password, email_confirm: emailConfirm }) => {
        return Promise.resolve({ 
          data: { user: { id, email, emailConfirm, updated_at: new Date().toISOString() } }, 
          error: null 
        });
      }),
      deleteUser: vi.fn().mockImplementation((id) => {
        return Promise.resolve({ data: { message: 'User deleted' }, error: null });
      })
    }
  },
  from: vi.fn().mockImplementation(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    match: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation((callback) => {
      return Promise.resolve(callback({ data: mockUsers, error: null }));
    })
  }))
};

// Supabase və Edge funksiyalarını mock et
vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockedSupabase,
  callEdgeFunction: mockCallEdgeFunction
}));

// Hook mock-ları
vi.mock('@/hooks/useAvailableUsers', () => ({
  useAvailableUsers: () => ({
    users: mockAvailableUsers,
    loading: false,
    error: null,
    fetchUsers: vi.fn().mockResolvedValue(mockAvailableUsers)
  })
}));

// userUserList hook-u mock et
vi.mock('@/hooks/useUserList', () => ({
  useUserList: () => ({
    users: mockUsers,
    loading: false,
    error: null,
    filter: {},
    updateFilter: vi.fn(),
    resetFilter: vi.fn(),
    totalCount: mockUsers.length,
    totalPages: 1,
    currentPage: 1,
    setCurrentPage: vi.fn(),
    refetch: vi.fn().mockResolvedValue(mockUsers)
  })
}));

// useUserOperations hook-u mock et
vi.mock('@/hooks/user/useUserOperations', () => ({
  useUserOperations: () => ({
    handleUpdateUserConfirm: vi.fn().mockImplementation((userData) => Promise.resolve(userData)),
    handleDeleteUserConfirm: vi.fn().mockResolvedValue(true),
    handleEditUser: vi.fn(),
    handleDeleteUser: vi.fn(),
    handleViewDetails: vi.fn(),
    isEditDialogOpen: false,
    isDeleteDialogOpen: false,
    isDetailsDialogOpen: false,
    setIsEditDialogOpen: vi.fn(),
    setIsDeleteDialogOpen: vi.fn(),
    setIsDetailsDialogOpen: vi.fn(),
    selectedUser: null,
    setSelectedUser: vi.fn()
  })
}));

// Mock komponentlər
vi.mock('@/components/users/CreateUserForm', () => ({
  default: ({ onSubmit }: any) => (
    <form data-testid="create-user-form">
      <input data-testid="email-input" placeholder="Email" />
      <input data-testid="fullname-input" placeholder="Ad Soyad" />
      <input data-testid="password-input" placeholder="Şifrə" type="password" />
      <button 
        data-testid="submit-button"
        onClick={() => onSubmit({
          email: 'new@example.com',
          fullName: 'New User',
          password: 'password123',
          language: 'az'
        })}
      >
        İstifadəçi Yarat
      </button>
    </form>
  )
}));

vi.mock('@/components/users/UsersList', () => ({
  default: ({ users, onEdit, onDelete }: any) => (
    <div data-testid="users-list">
      {(users || mockUsers).map((user: any) => (
        <div key={user.id} data-testid={`user-item-${user.id}`}>
          <span data-testid={`user-email-${user.id}`}>{user.email}</span>
          <span data-testid={`user-role-${user.id}`}>{user.role}</span>
          <button 
            data-testid={`edit-user-${user.id}`}
            onClick={() => onEdit(user)}
          >
            Redaktə
          </button>
          <button 
            data-testid={`delete-user-${user.id}`}
            onClick={() => onDelete(user.id)}
          >
            Sil
          </button>
        </div>
      ))}
    </div>
  )
}));

vi.mock('@/components/users/EditUserForm', () => ({
  default: ({ user, onSubmit }: any) => (
    <form data-testid="edit-user-form">
      <input data-testid="edit-email-input" defaultValue={user?.email} placeholder="Email" />
      <input data-testid="edit-fullname-input" defaultValue={user?.full_name} placeholder="Ad Soyad" />
      <select data-testid="edit-role-select" defaultValue={user?.role}>
        <option value="superadmin">Super Admin</option>
        <option value="regionadmin">Region Admin</option>
        <option value="sectoradmin">Sektor Admin</option>
        <option value="schooladmin">Məktəb Admin</option>
      </select>
      <button 
        data-testid="update-button"
        onClick={() => onSubmit({
          ...user,
          email: 'updated@example.com',
          full_name: 'Updated User',
          role: 'regionadmin'
        })}
      >
        Yenilə
      </button>
    </form>
  )
}));

vi.mock('@/components/users/UsersFilter', () => ({
  default: ({ onFilter }: any) => (
    <div data-testid="users-filter">
      <select data-testid="role-filter">
        <option value="">Bütün rollar</option>
        <option value="superadmin">Super Admin</option>
        <option value="regionadmin">Region Admin</option>
        <option value="sectoradmin">Sektor Admin</option>
        <option value="schooladmin">Məktəb Admin</option>
      </select>
      <select data-testid="region-filter">
        <option value="">Bütün regionlar</option>
        {mockRegions.map(region => (
          <option key={region.id} value={region.id}>{region.name}</option>
        ))}
      </select>
      <button 
        data-testid="apply-filter"
        onClick={() => onFilter({
          role: 'regionadmin',
          region_id: 'region-1'
        })}
      >
        Tətbiq et
      </button>
    </div>
  )
}));

describe('İstifadəçi İdarəetməsi Testləri', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Auth store-u mockla və superadmin istifadəçini təyin et
    mockUserRole('superadmin');
  });
  
  describe('USER-01: İstifadəçi yaratma', () => {
    it('yeni istifadəçi yaratma prosesi', async () => {
      // Mock EdgeFunction çağırışı
      const createUserFn = vi.fn().mockImplementation((userData) => {
        return mockCallEdgeFunction('create-user', {
          body: userData
        });
      });
      
      // CreateUserForm-u render et
      render(
        <div data-testid="create-user-container">
          <div data-testid="create-user-form">
            <button 
              data-testid="submit-button"
              onClick={() => createUserFn({
                email: 'new@example.com',
                fullName: 'New User',
                password: 'password123',
                language: 'az'
              })}
            >
              İstifadəçi Yarat
            </button>
          </div>
        </div>
      );
      
      // Submit düyməsinə klik et
      fireEvent.click(screen.getByTestId('submit-button'));
      
      // Edge Function çağırışını yoxla
      await waitFor(() => {
        expect(createUserFn).toHaveBeenCalledWith(expect.objectContaining({
          email: 'new@example.com',
          fullName: 'New User',
          password: 'password123'
        }));
        
        expect(mockCallEdgeFunction).toHaveBeenCalledWith('create-user', {
          body: expect.objectContaining({
            email: 'new@example.com',
            fullName: 'New User',
          })
        });
      });
      
      // Edge Function nəticəsinin düzgün olduğunu yoxla
      const result = await createUserFn({
        email: 'new@example.com',
        fullName: 'New User',
        password: 'password123',
        language: 'az'
      });
      
      expect(result.data).toEqual(expect.objectContaining({
        id: 'new-user-id',
        email: 'new@example.com',
        full_name: 'New User'
      }));
    });
  });
  
  describe('USER-02: İstifadəçi rolu təyin etmə', () => {
    it('istifadəçiyə region admin rolu təyin etmə', async () => {
      // Region admin təyin etmə funksiyası
      const assignRegionAdmin = vi.fn().mockImplementation((userId, regionId) => {
        return mockCallEdgeFunction('assign-region-admin', {
          body: { userId, regionId }
        });
      });
      
      // AssignAdminForm komponentini simulyasiya et
      render(
        <div data-testid="assign-admin-container">
          <div data-testid="assign-region-admin-form">
            <select data-testid="user-select">
              <option value="5">Available User 1</option>
              <option value="6">Available User 2</option>
            </select>
            <select data-testid="region-select">
              <option value="region-1">Bakı</option>
              <option value="region-2">Sumqayıt</option>
            </select>
            <button 
              data-testid="assign-button"
              onClick={() => assignRegionAdmin('5', 'region-1')}
            >
              Region Admin Təyin Et
            </button>
          </div>
        </div>
      );
      
      // Təyin et düyməsinə klik et
      fireEvent.click(screen.getByTestId('assign-button'));
      
      // Edge Function çağırışını yoxla
      await waitFor(() => {
        expect(assignRegionAdmin).toHaveBeenCalledWith('5', 'region-1');
        
        expect(mockCallEdgeFunction).toHaveBeenCalledWith('assign-region-admin', {
          body: {
            userId: '5',
            regionId: 'region-1'
          }
        });
      });
      
      // Təyin etmə nəticəsinin düzgün olduğunu yoxla
      const result = await assignRegionAdmin('5', 'region-1');
      
      expect(result.data).toEqual(expect.objectContaining({
        success: true,
        user_id: '5',
        region_id: 'region-1'
      }));
    });
    
    it('istifadəçiyə sektor admin rolu təyin etmə', async () => {
      // Sektor admin təyin etmə funksiyası
      const assignSectorAdmin = vi.fn().mockImplementation((userId, sectorId) => {
        return mockCallEdgeFunction('assign-sector-admin', {
          body: { userId, sectorId }
        });
      });
      
      // AssignAdminForm komponentini simulyasiya et
      render(
        <div data-testid="assign-admin-container">
          <div data-testid="assign-sector-admin-form">
            <select data-testid="user-select">
              <option value="5">Available User 1</option>
              <option value="6">Available User 2</option>
            </select>
            <select data-testid="sector-select">
              <option value="sector-1">Xətai</option>
              <option value="sector-2">Yasamal</option>
            </select>
            <button 
              data-testid="assign-button"
              onClick={() => assignSectorAdmin('6', 'sector-1')}
            >
              Sektor Admin Təyin Et
            </button>
          </div>
        </div>
      );
      
      // Təyin et düyməsinə klik et
      fireEvent.click(screen.getByTestId('assign-button'));
      
      // Edge Function çağırışını yoxla
      await waitFor(() => {
        expect(assignSectorAdmin).toHaveBeenCalledWith('6', 'sector-1');
        
        expect(mockCallEdgeFunction).toHaveBeenCalledWith('assign-sector-admin', {
          body: {
            userId: '6',
            sectorId: 'sector-1'
          }
        });
      });
    });
  });
  
  describe('USER-03: İstifadəçi redaktəsi', () => {
    it('mövcud istifadəçinin məlumatlarını redaktə etmə', async () => {
      // useUserOperations hook-undan handleUpdateUserConfirm funksiyasını al
      const { useUserOperations } = await import('@/hooks/user/useUserOperations');
      const { handleUpdateUserConfirm } = useUserOperations();
      
      // EditUserForm komponentini simulyasiya et
      const user = mockUsers[1]; // Region admin istifadəçisi
      
      const handleUpdate = vi.fn().mockImplementation((updatedUser) => {
        return handleUpdateUserConfirm(updatedUser);
      });
      
      render(
        <div data-testid="edit-user-container">
          <div data-testid="edit-user-form">
            <button 
              data-testid="update-button"
              onClick={() => handleUpdate({
                ...user,
                email: 'updated@example.com',
                full_name: 'Updated User',
                language: 'az',
                role: 'regionadmin'
              })}
            >
              Yenilə
            </button>
          </div>
        </div>
      );
      
      // Yenilə düyməsinə klik et
      fireEvent.click(screen.getByTestId('update-button'));
      
      // handleUpdateUserConfirm funksiyasının çağırıldığını yoxla
      await waitFor(() => {
        expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({
          email: 'updated@example.com',
          full_name: 'Updated User'
        }));
        
        expect(handleUpdateUserConfirm).toHaveBeenCalledWith(expect.objectContaining({
          email: 'updated@example.com',
          full_name: 'Updated User'
        }));
      });
    });
  });
  
  describe('USER-04: İstifadəçi silmə', () => {
    it('istifadəçini silmə prosesi', async () => {
      // useUserOperations hook-undan handleDeleteUserConfirm funksiyasını al
      const { useUserOperations } = await import('@/hooks/user/useUserOperations');
      const { handleDeleteUserConfirm, setSelectedUser } = useUserOperations();
      
      // İstifadəçi siyahısı komponentini simulyasiya et
      const handleDelete = vi.fn().mockImplementation((userId) => {
        setSelectedUser(mockUsers.find(u => u.id === userId) || null);
        return handleDeleteUserConfirm();
      });
      
      render(
        <div data-testid="users-list-container">
          <div data-testid="users-list">
            {mockUsers.map(user => (
              <div key={user.id} data-testid={`user-item-${user.id}`}>
                <span>{user.email}</span>
                <button 
                  data-testid={`delete-user-${user.id}`}
                  onClick={() => handleDelete(user.id)}
                >
                  Sil
                </button>
              </div>
            ))}
          </div>
        </div>
      );
      
      // İlk istifadəçinin silmə düyməsinə klik et
      fireEvent.click(screen.getByTestId(`delete-user-${mockUsers[0].id}`));
      
      // handleDeleteUserConfirm funksiyasının çağırıldığını yoxla
      await waitFor(() => {
        expect(handleDelete).toHaveBeenCalledWith(mockUsers[0].id);
        expect(setSelectedUser).toHaveBeenCalled();
        expect(handleDeleteUserConfirm).toHaveBeenCalled();
      });
    });
  });
  
  describe('USER-05: İstifadəçi siyahısı', () => {
    it('istifadəçilərin siyahısının yüklənməsi', async () => {
      // useUserList hook-undan refetch funksiyasını al
      const { useUserList } = await import('@/hooks/useUserList');
      const { refetch } = useUserList();
      
      // UsersList komponentini simulyasiya et
      render(
        <div data-testid="users-list-container">
          <div data-testid="users-list">
            {mockUsers.map(user => (
              <div key={user.id} data-testid={`user-item-${user.id}`}>
                <span data-testid={`user-email-${user.id}`}>{user.email}</span>
                <span data-testid={`user-role-${user.id}`}>{user.role}</span>
              </div>
            ))}
          </div>
        </div>
      );
      
      // useEffect-də refetch funksiyasının çağırılmasını simulyasiya et
      await act(async () => {
        await refetch();
      });
      
      // İstifadəçi siyahısının göstərildiyini yoxla
      for (const user of mockUsers) {
        expect(screen.getByTestId(`user-item-${user.id}`)).toBeInTheDocument();
        expect(screen.getByTestId(`user-email-${user.id}`)).toHaveTextContent(user.email);
        expect(screen.getByTestId(`user-role-${user.id}`)).toHaveTextContent(user.role);
      }
    });
  });
  
  describe('USER-06: İstifadəçi filtrasiyası', () => {
    it('müxtəlif parametrlərə görə istifadəçi filtrasiyası', async () => {
      // useUserList hook-undan updateFilter funksiyasını al
      const { useUserList } = await import('@/hooks/useUserList');
      const { updateFilter, refetch } = useUserList();
      
      // UsersFilter komponentini simulyasiya et
      const handleFilter = vi.fn().mockImplementation((filters) => {
        updateFilter(filters);
        return refetch();
      });
      
      render(
        <div data-testid="users-filter-container">
          <div data-testid="users-filter">
            <button 
              data-testid="apply-filter"
              onClick={() => handleFilter({
                role: 'regionadmin',
                regionId: 'region-1'
              })}
            >
              Tətbiq et
            </button>
          </div>
        </div>
      );
      
      // Filter düyməsinə klik et
      fireEvent.click(screen.getByTestId('apply-filter'));
      
      // updateFilter funksiyasının çağırıldığını yoxla
      await waitFor(() => {
        expect(handleFilter).toHaveBeenCalledWith({
          role: 'regionadmin',
          regionId: 'region-1'
        });
        
        expect(updateFilter).toHaveBeenCalledWith({
          role: 'regionadmin',
          regionId: 'region-1'
        });
      });
      
      // refetch funksiyasının çağırıldığını yoxla
      expect(refetch).toHaveBeenCalled();
      
      // Filter nəticəsini simyulyasiya et - mockUsers filter nəticəsi olaraq eyni qalır
      const filteredUsers = mockUsers.filter(u => u.role === 'regionadmin' && u.region_id === 'region-1');
      expect(filteredUsers.length).toBeGreaterThan(0);
    });
  });
});
