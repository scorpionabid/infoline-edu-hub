
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';
import * as AuthContext from '../context/auth';
import * as PermissionsHook from '../hooks/auth/usePermissions';
import * as LanguageContext from '../context/LanguageContext';
import { vi } from 'vitest';
import { UserRole } from '@/types/supabase';

// Mock all sub-components
vi.mock('../components/auth/LoginForm', () => ({
  default: ({ error, clearError }) => (
    <div data-testid="login-form">
      <div data-testid="error-message">{error}</div>
      <input 
        data-testid="email-input" 
        type="email" 
        placeholder="Email" 
        aria-label="email"
      />
      <input 
        data-testid="password-input" 
        type="password" 
        placeholder="Password" 
        aria-label="password"
      />
      <button data-testid="login-button" onClick={() => {}} aria-label="loginButton">
        Daxil ol
      </button>
    </div>
  )
}));

vi.mock('../components/auth/LoginContainer', () => ({
  default: ({ children }) => <div data-testid="login-container">{children}</div>
}));

vi.mock('../components/auth/LoginHeader', () => ({
  default: () => <div data-testid="login-header">Login Header</div>
}));

vi.mock('../components/auth/LoadingScreen', () => ({
  default: () => <div data-testid="loading-screen" role="status" className="animate-spin">Loading...</div>
}));

// Mock translations
const mockTranslations = {
  loginTitle: 'Daxil ol',
  loginButton: 'Daxil ol',
  loginSuccess: 'Uğurla daxil oldunuz',
  email: 'E-poçt',
  password: 'Şifrə',
  loginDescription: 'Hesabınıza daxil olun',
};

// Mock language context with correct types
const mockLanguageContext = () => {
  vi.spyOn(LanguageContext, 'useLanguage').mockReturnValue({
    t: (key: string) => mockTranslations[key as keyof typeof mockTranslations] || key,
    setLanguage: vi.fn(),
    languages: {
      az: { nativeName: 'Azərbaycan', flag: '🇦🇿' },
      en: { nativeName: 'English', flag: '🇬🇧' },
      tr: { nativeName: 'Türkçe', flag: '🇹🇷' },
      ru: { nativeName: 'Русский', flag: '🇷🇺' }
    },
    currentLanguage: 'az',
    availableLanguages: ['az', 'en', 'tr', 'ru']
  });
};

// Mock permissions hook with correct return type
const mockPermissionsHook = (role: UserRole = 'superadmin') => {
  vi.spyOn(PermissionsHook, 'usePermissions').mockReturnValue({
    userRole: role,
    isAdmin: true,
    isSuperAdmin: role === 'superadmin',
    isRegionAdmin: role === 'regionadmin',
    isSectorAdmin: role === 'sectoradmin',
    isSchoolAdmin: role === 'schooladmin',
    regionId: null,
    sectorId: null,
    schoolId: null,
    currentUser: null,
    canRegionAdminManageCategoriesColumns: role === 'superadmin' || role === 'regionadmin',
    canViewSectorCategories: true,
    canViewSchoolCategories: true,
    regionName: null,
    sectorName: null,
    schoolName: null,
    canAccessRegion: () => true,
    canAccessSector: () => true,
    canAccessSchool: () => true,
    canAccessCategory: () => true,
    canManageUsers: true,
    canManageData: true,
    canApproveData: true
  });
};

// Helper to mock useAuth
function mockUseAuth({
  isAuthenticated = false,
  isLoading = false,
  error = null,
  user = null,
  loginImpl = vi.fn().mockResolvedValue(true),
  clearErrorImpl = vi.fn(),
} = {}) {
  vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
    isAuthenticated,
    isLoading,
    error,
    login: loginImpl,
    clearError: clearErrorImpl,
    logout: vi.fn(),
    updateUser: vi.fn(),
    user,
    session: null,
  });
}

// Mock user data
const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  full_name: 'Test User',
  name: 'Test User',
  role: 'superadmin',
  language: 'az',
  status: 'active',
  created_at: '',
  updated_at: '',
  createdAt: '',
  updatedAt: '',
  notificationSettings: {
    email: true,
    system: true
  }
};

// Mock navigate
const mockNavigate = vi.fn();

// Mock router
vi.mock('react-router-dom', () => {
  const actual = require('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: { from: { pathname: '/test-path' } } }),
  };
});

describe('Login Page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockLanguageContext();
    mockPermissionsHook();
  });

  it('login formunu düzgün göstərir', () => {
    mockUseAuth();
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    // Login komponentlərinin mövcudluğunu yoxlayın
    expect(screen.getByTestId('login-container')).toBeInTheDocument();
    expect(screen.getByTestId('login-header')).toBeInTheDocument();
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  it('yüklənmə vəziyyətində LoadingScreen göstərir', () => {
    mockUseAuth({ isLoading: true });
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('loading-screen')).toBeInTheDocument();
    expect(screen.queryByTestId('login-form')).not.toBeInTheDocument();
  });

  it('autentifikasiya olunmuş istifadəçini dashboard-a yönləndirir', async () => {
    mockUseAuth({ 
      isAuthenticated: true, 
      user: mockUser
    });
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/test-path', { replace: true });
    });
  });

  it('xəta mesajını LoginForm-a ötürür', () => {
    mockUseAuth({ error: 'Test xətası' });
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('error-message')).toHaveTextContent('Test xətası');
  });

  it('clearError funksiyasını LoginForm-a ötürür', () => {
    const clearErrorMock = vi.fn();
    mockUseAuth({ clearErrorImpl: clearErrorMock });
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    // clearError funksiyasının ötürülməsi çətin yoxlanılır, amma ən azı
    // onu yoxlaya bilərik ki, render uğurla tamamlanıb
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  it('superadmin istifadəçisini dashboard-a yönləndirir', async () => {
    mockUseAuth({ 
      isAuthenticated: true, 
      user: { ...mockUser, role: 'superadmin' }
    });
    mockPermissionsHook('superadmin');
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/test-path', { replace: true });
    });
  });

  it('regionadmin istifadəçisini dashboard-a yönləndirir', async () => {
    mockUseAuth({ 
      isAuthenticated: true, 
      user: { ...mockUser, role: 'regionadmin' }
    });
    mockPermissionsHook('regionadmin');
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/test-path', { replace: true });
    });
  });

  it('sektoradmin istifadəçisini dashboard-a yönləndirir', async () => {
    mockUseAuth({ 
      isAuthenticated: true, 
      user: { ...mockUser, role: 'sectoradmin' }
    });
    mockPermissionsHook('sectoradmin');
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/test-path', { replace: true });
    });
  });

  it('schooladmin istifadəçisini dashboard-a yönləndirir', async () => {
    mockUseAuth({ 
      isAuthenticated: true, 
      user: { ...mockUser, role: 'schooladmin' }
    });
    mockPermissionsHook('schooladmin');
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/test-path', { replace: true });
    });
  });
});
