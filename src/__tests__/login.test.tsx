
/**
 * Login Page Testing
 * 
 * Bu test faylı, Login səhifəsinin müxtəlif ssenarilərdə düzgün işləməsini təmin edir:
 * - Login formu düzgün göstərilir
 * - Autentifikasiya vəziyyətində yüklənmə görüntüsü göstərilir
 * - Giriş uğurludursa, yönləndirmə düzgün işləyir
 * - Xəta mesajları düzgün göstərilir
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { vi, expect, beforeEach, describe, it } from 'vitest';
import '@testing-library/jest-dom';

// Login komponenti importu
import Login from '@/pages/Login';

// Mock navigate funksiyası
const mockNavigate = vi.fn();

// Mock store obyekti
const mockStore = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  error: null,
  clearError: vi.fn(),
  initializeAuth: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  initialized: true
};

// MemoryRouter və react-router-dom üçün yeni yönləndirmə üslubundan istifadə edəcəyik

// Yeni bir mock komponent yaradırıq
const MockRouter = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="memory-router">{children}</div>;
};

// react-router-dom komponentlərini mock edirik
vi.mock('react-router-dom', () => {
  return {
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: { from: { pathname: '/dashboard' } } }),
    MemoryRouter: ({ children }: { children: React.ReactNode }) => <MockRouter>{children}</MockRouter>
  };
});

// Auth hook-unu mock et
vi.mock('@/hooks/auth/useAuthStore', () => {
  // getState funksiyasını birbaşa useAuthStore-a əlavə edirik
  const useAuthStoreWithGetState = ((selector: any) => {
    if (typeof selector === 'function') {
      return selector(mockStore);
    }
    return mockStore;
  }) as any;
  
  // Starik olaraq getState funksiyasını əlavə edirik
  useAuthStoreWithGetState.getState = () => mockStore;
  
  return {
    useAuthStore: useAuthStoreWithGetState,
    selectIsAuthenticated: (state: any) => state.isAuthenticated,
    selectIsLoading: (state: any) => state.isLoading,
    selectUser: (state: any) => state.user,
    selectError: (state: any) => state.error,
  };
});

// Login səhifəsi komponentlərini mock et
vi.mock('@/components/auth/LoginForm', () => ({
  default: ({ error, clearError }: { error: string | null; clearError: () => void }) => (
    <div data-testid="login-form">
      {error && <div data-testid="error-message">{error}</div>}
      <input data-testid="email-input" type="email" aria-label="email" />
      <input data-testid="password-input" type="password" aria-label="password" />
      <button data-testid="login-button" aria-label="loginButton">Daxil ol</button>
    </div>
  )
}));

vi.mock('@/components/auth/LoginContainer', () => ({
  default: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="login-container">{children}</div>
}));

vi.mock('@/components/auth/LoginHeader', () => ({
  default: () => <div data-testid="login-header">Login Header</div>
}));

vi.mock('@/components/auth/LoadingScreen', () => ({
  default: ({ message }: { message?: string }) => 
    <div data-testid="loading-screen">{message || 'Loading...'}</div>
}));

/**
 * Login Səhifəsi Test Suiti
 * 
 * Bu testlər login səhifəsinin müxtəlif ssenarilər altında düzgün davranışını yoxlayır:
 * 1. Login formu düzgün göstərilir
 * 2. Yüklənmə vəziyyəti düzgün göstərilir
 * 3. Autentifikasiya olunduqda dashboard-a yönləndirmə baş verir
 * 4. Xəta mesajları düzgün göstərilir
 */
describe('Login Page', () => {
  // Hər testdən əvvəl mockları sıfırla
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    
    // Default mock vəziyyətini təyin et
    Object.assign(mockStore, {
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null,
      initialized: true
    });
  });
  
  // Test 1: Login səhifəsi düzgün render olunurmu?
  it('login formunu düzgün render edir', () => {
    render(
      <MockRouter>
        <Login />
      </MockRouter>
    );
    
    // Login formu və header-in görünməsini yoxla
    expect(screen.getByTestId('login-container')).toBeInTheDocument();
    expect(screen.getByTestId('login-header')).toBeInTheDocument();
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
    
    // Login formu elementlərinin mövcudluğunu yoxla
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
  });
  
  // Test 2: Yüklənmə vəziyyəti düzgün göstərilirmi?
  it('yüklənmə vəziyyətində loading screen göstərir', () => {
    // isLoading true təyin edirik
    Object.assign(mockStore, {
      isLoading: true
    });
    
    render(
      <MockRouter>
        <Login />
      </MockRouter>
    );
    
    // Loading screen-in görünməsini yoxla
    expect(screen.getByTestId('loading-screen')).toBeInTheDocument();
    
    // Login formu görünməməlidir
    expect(screen.queryByTestId('login-form')).not.toBeInTheDocument();
  });
  
  // Test 3: Autentifikasiya olunduqda yönləndirmə baş verirmi?
  it('autentifikasiya olunduqda dashboard-a yönləndirir', async () => {
    // Jest timers istifadə edirik ki, setTimeout-ları simulyasiya edək
    vi.useFakeTimers();
    
    // İstifadəçi autentifikasiya olunub
    Object.assign(mockStore, {
      isAuthenticated: true,
      user: { id: 'test-user-id', email: 'test@example.com' }
    });
    
    render(
      <MockRouter>
        <Login />
      </MockRouter>
    );
    
    // setTimeout-u simulyasiya et
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    // Navigate funksiyasının dashboard-a yönləndirdiyini yoxla
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    
    // Real timers-a qayıt
    vi.useRealTimers();
  });
  
  // Test 4: Xəta olduqda xəta mesajı göstərilirmi?
  it('xəta mesajını göstərir', () => {
    // Xəta mesajı təyin edirik
    Object.assign(mockStore, {
      error: 'Test xəta mesajı'
    });
    
    render(
      <MockRouter>
        <Login />
      </MockRouter>
    );
    
    // Xəta mesajının göstərildiyini yoxla
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByTestId('error-message')).toHaveTextContent('Test xəta mesajı');
  });
  
  // Test 5: initializeAuth çağırılırmı?
  it('əgər auth initialize olmayıbsa, initializeAuth çağırılır', () => {
    // Initialize olmayıb
    Object.assign(mockStore, {
      initialized: false
    });
    
    render(
      <MockRouter>
        <Login />
      </MockRouter>
    );
    
    // initializeAuth funksiyasının çağırıldığını yoxlayırıq
    // Bu testin işləməsi üçün Login.tsx komponentinin 
    // useEffect blokunun işləməsi lazımdır
    expect(mockStore.initializeAuth).toHaveBeenCalled();
  });
});


    
// //     // Login komponentlərinin mövcudluğunu yoxlayın
// //     expect(screen.getByTestId('login-container')).toBeInTheDocument();
// //     expect(screen.getByTestId('login-header')).toBeInTheDocument();
// //     expect(screen.getByTestId('login-form')).toBeInTheDocument();
// //   });

// //   it('yüklənmə vəziyyətində LoadingScreen göstərir', () => {
// //     mockUseAuth({ isLoading: true });
    
// //     render(
// //       <MemoryRouter>
// //         <Login />
// //       </MemoryRouter>
// //     );
    
// //     expect(screen.getByTestId('loading-screen')).toBeInTheDocument();
// //     expect(screen.queryByTestId('login-form')).not.toBeInTheDocument();
// //   });

// //   it('autentifikasiya olunmuş istifadəçini dashboard-a yönləndirir', async () => {
// //     mockUseAuth({ 
// //       isAuthenticated: true, 
// //       user: mockUser
// //     });
    
// //     render(
// //       <MemoryRouter>
// //         <Login />
// //       </MemoryRouter>
// //     );
    
// //     await waitFor(() => {
// //       expect(mockNavigate).toHaveBeenCalledWith('/test-path', { replace: true });
// //     });
// //   });

// //   it('xəta mesajını LoginForm-a ötürür', () => {
// //     mockUseAuth({ error: 'Test xətası' });
    
// //     render(
// //       <MemoryRouter>
// //         <Login />
// //       </MemoryRouter>
// //     );
    
// //     expect(screen.getByTestId('error-message')).toHaveTextContent('Test xətası');
// //   });

// //   it('clearError funksiyasını LoginForm-a ötürür', () => {
// //     const clearErrorMock = vi.fn();
// //     mockUseAuth({ clearErrorImpl: clearErrorMock });
    
// //     render(
// //       <MemoryRouter>
// //         <Login />
// //       </MemoryRouter>
// //     );
    
// //     // clearError funksiyasının ötürülməsi çətin yoxlanılır, amma ən azı
// //     // onu yoxlaya bilərik ki, render uğurla tamamlanıb
// //     expect(screen.getByTestId('login-form')).toBeInTheDocument();
// //   });

// //   it('superadmin istifadəçisini dashboard-a yönləndirir', async () => {
// //     mockUseAuth({ 
// //       isAuthenticated: true, 
// //       user: { ...mockUser, role: 'superadmin' }
// //     });
// //     mockPermissionsHook('superadmin');
    
// //     render(
// //       <MemoryRouter>
// //         <Login />
// //       </MemoryRouter>
// //     );
    
// //     await waitFor(() => {
// //       expect(mockNavigate).toHaveBeenCalledWith('/test-path', { replace: true });
// //     });
// //   });

// //   it('regionadmin istifadəçisini dashboard-a yönləndirir', async () => {
// //     mockUseAuth({ 
// //       isAuthenticated: true, 
// //       user: { ...mockUser, role: 'regionadmin' }
// //     });
// //     mockPermissionsHook('regionadmin');
    
// //     render(
// //       <MemoryRouter>
// //         <Login />
// //       </MemoryRouter>
// //     );
    
// //     await waitFor(() => {
// //       expect(mockNavigate).toHaveBeenCalledWith('/test-path', { replace: true });
// //     });
// //   });

// //   it('sektoradmin istifadəçisini dashboard-a yönləndirir', async () => {
// //     mockUseAuth({ 
// //       isAuthenticated: true, 
// //       user: { ...mockUser, role: 'sectoradmin' }
// //     });
// //     mockPermissionsHook('sectoradmin');
    
// //     render(
// //       <MemoryRouter>
// //         <Login />
// //       </MemoryRouter>
// //     );
    
// //     await waitFor(() => {
// //       expect(mockNavigate).toHaveBeenCalledWith('/test-path', { replace: true });
// //     });
// //   });

// //   it('schooladmin istifadəçisini dashboard-a yönləndirir', async () => {
// //     mockUseAuth({ 
// //       isAuthenticated: true, 
// //       user: { ...mockUser, role: 'schooladmin' }
// //     });
// //     mockPermissionsHook('schooladmin');
    
// //     render(
// //       <MemoryRouter>
// //         <Login />
// //       </MemoryRouter>
// //     );
    
// //     await waitFor(() => {
// //       expect(mockNavigate).toHaveBeenCalledWith('/test-path', { replace: true });
// //     });
// //   });
// // });
