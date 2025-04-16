import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import { ProtectedRoute } from '@/routes/AppRoutes';
import * as AuthContext from '@/context/auth';
import * as PermissionsHook from '@/hooks/auth/usePermissions';

// Mock komponentləri
const MockDashboard = () => <div data-testid="dashboard">Dashboard Content</div>;
const MockAccessDenied = () => <div data-testid="access-denied">Access Denied</div>;

// AccessDenied komponentini mockla
vi.mock('@/components/AccessDenied', () => ({
  default: () => <MockAccessDenied />
}));

// useNavigate mockla
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Auth contextini mockla
function mockUseAuth({
  isAuthenticated = false,
  isLoading = false,
  user = null
} = {}) {
  vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
    isAuthenticated,
    isLoading,
    user,
    login: vi.fn(),
    logout: vi.fn(),
    clearError: vi.fn(),
    updateUser: vi.fn(),
    error: null
  });
}

// Permission hookunu mockla
function mockPermissions(userRole = 'superadmin') {
  vi.spyOn(PermissionsHook, 'usePermissions').mockReturnValue({
    userRole,
    hasRole: vi.fn().mockResolvedValue(true),
    hasRegionAccess: vi.fn().mockResolvedValue(true),
    hasSectorAccess: vi.fn().mockResolvedValue(true),
    hasSchoolAccess: vi.fn().mockResolvedValue(true),
    sectorId: null,
    regionId: null,
    canRegionAdminManageCategoriesColumns: true
  });
}

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('yüklənmə vəziyyətində spinner göstərir', () => {
    mockUseAuth({ isLoading: true });
    mockPermissions();

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <MockDashboard />
        </ProtectedRoute>
      </MemoryRouter>
    );

    // Spinner göstərilməlidir
    const spinner = screen.getByText('', { selector: '.animate-spin' });
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
    
    // Qorunan məzmun göstərilməməlidir
    expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
  });

  it('autentifikasiya olmayan istifadəçini login səhifəsinə yönləndirir', () => {
    mockUseAuth({ isAuthenticated: false });
    mockPermissions();

    // Navigate komponentini simulyasiya etmək üçün daha mürəkkəb render
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <MockDashboard />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Qorunan məzmun göstərilməməlidir
    expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
    
    // Login səhifəsi göstərilməlidir
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('autentifikasiya olan istifadəçiyə qorunan məzmunu göstərir', () => {
    mockUseAuth({ 
      isAuthenticated: true, 
      user: { id: 'user-1', role: 'superadmin' } 
    });
    mockPermissions('superadmin');

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <MockDashboard />
        </ProtectedRoute>
      </MemoryRouter>
    );

    // Qorunan məzmun göstərilməlidir
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });

  it('icazəsi olmayan istifadəçiyə AccessDenied göstərir', () => {
    mockUseAuth({ 
      isAuthenticated: true, 
      user: { id: 'user-1', role: 'schooladmin' } 
    });
    mockPermissions('schooladmin');

    render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={['superadmin', 'regionadmin']}>
          <MockDashboard />
        </ProtectedRoute>
      </MemoryRouter>
    );

    // Qorunan məzmun göstərilməməlidir
    expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
    
    // AccessDenied komponenti göstərilməlidir
    expect(screen.getByTestId('access-denied')).toBeInTheDocument();
  });

  it('icazəsi olan istifadəçiyə qorunan məzmunu göstərir', () => {
    mockUseAuth({ 
      isAuthenticated: true, 
      user: { id: 'user-1', role: 'regionadmin' } 
    });
    mockPermissions('regionadmin');

    render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={['superadmin', 'regionadmin']}>
          <MockDashboard />
        </ProtectedRoute>
      </MemoryRouter>
    );

    // Qorunan məzmun göstərilməlidir
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    
    // AccessDenied komponenti göstərilməməlidir
    expect(screen.queryByTestId('access-denied')).not.toBeInTheDocument();
  });

  it('xüsusi redirectUrl parametrini dəstəkləyir', () => {
    mockUseAuth({ isAuthenticated: false });
    mockPermissions();

    // Navigate komponentini simulyasiya etmək üçün daha mürəkkəb render
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={
            <ProtectedRoute redirectUrl="/custom-login">
              <MockDashboard />
            </ProtectedRoute>
          } />
          <Route path="/custom-login" element={<div data-testid="custom-login">Custom Login</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Qorunan məzmun göstərilməməlidir
    expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
    
    // Xüsusi login səhifəsi göstərilməlidir
    expect(screen.getByTestId('custom-login')).toBeInTheDocument();
  });
});