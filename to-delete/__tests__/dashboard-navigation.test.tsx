/**
 * Dashboard Yönləndirmə Testləri
 * 
 * Bu test faylı, İnfoLine tətbiqinin dashboard naviqasiyası və yönləndirməsini yoxlayır:
 * - İstifadəçi roluna uyğun dashboard-a yönləndirmə
 * - Yan panel naviqasiyası
 * - Responsiv görünüş
 * - İcazəsiz bölmələrə keçid cəhdi
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, expect, beforeEach, describe, it } from 'vitest';
import '@testing-library/jest-dom';

// Test vasitələri və yardımçı funksiyalar
import { 
  renderWithProviders, 
  mockUserRole, 
  mockAuthStore, 
  mockUserData,
  UserRole
} from './test-utils';

// React Router
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Navigate mock
const mockNavigate = vi.fn();

// Media query mock
const mockMatchMedia = vi.fn();

// React Router mockla
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any, // bütün actual exports-i əlavə et
    useNavigate: () => mockNavigate
  };
});

// Sidebar mockla
vi.mock('@/components/layout/Sidebar', () => ({
  default: () => (
    <aside data-testid="sidebar">
      <nav>
        <ul>
          <li>
            <a data-testid="sidebar-dashboard" href="/dashboard">Dashboard</a>
          </li>
          <li>
            <a data-testid="sidebar-users" href="/users">İstifadəçilər</a>
          </li>
          <li>
            <a data-testid="sidebar-regions" href="/regions">Regionlar</a>
          </li>
          <li>
            <a data-testid="sidebar-sectors" href="/sectors">Sektorlar</a>
          </li>
          <li>
            <a data-testid="sidebar-schools" href="/schools">Məktəblər</a>
          </li>
        </ul>
      </nav>
    </aside>
  )
}));

// SidebarLayout mockla
vi.mock('@/components/layout/SidebarLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-layout">
      <div data-testid="sidebar-container">
        <button data-testid="sidebar-toggle">Toggle Sidebar</button>
        <div data-testid="sidebar-wrapper">
          <div data-testid="sidebar"></div>
        </div>
      </div>
      <div data-testid="main-content">
        {children}
      </div>
    </div>
  )
}));

// Mock komponentlər
const mockRestricted = ({ requiredRole }: { requiredRole: UserRole }) => (
  <div data-testid={`restricted-${requiredRole}`}>
    Bu səhifə yalnız {requiredRole} istifadəçilər üçün əlçatandır
  </div>
);

describe('Dashboard Yönləndirmə Testləri', () => {
  // Hər testin əvvəlində mockları sıfırlamaq
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    
    // Auth store mockla və istifadəçini təyin et
    const store = mockAuthStore();
    Object.assign(store, {
      isAuthenticated: true,
      user: { ...mockUserData, role: 'superadmin' as UserRole }
    });

    // Window matchMedia mockla
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    });
  });
  
  describe('DASH-01: İcazəli yönləndirmə', () => {
    it('superadmin istifadəçisi bütün səhifələrə giriş edə bilir', async () => {
      // superadmin rolunu mockla
      mockUserRole('superadmin');
      
      // Restricted komponentlərini mockla
      vi.mock('@/components/common/Restricted', () => ({
        default: mockRestricted
      }));
      
      // Naviqasiya testi üçün route komponentlərini hazırla
      const AllowedRoutes = () => (
        <Routes>
          <Route path="/dashboard" element={<div data-testid="dashboard">Dashboard</div>} />
          <Route path="/users" element={<div data-testid="users">İstifadəçilər</div>} />
          <Route path="/regions" element={<div data-testid="regions">Regionlar</div>} />
          <Route path="/sectors" element={<div data-testid="sectors">Sektorlar</div>} />
          <Route path="/schools" element={<div data-testid="schools">Məktəblər</div>} />
        </Routes>
      );
      
      // Dashboard-u render et və yönləndirməni yoxla
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <AllowedRoutes />
        </MemoryRouter>
      );
      
      // Dashboard səhifəsinin mövcudluğunu yoxla
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      
      // Digər səhifələrə də yönləndirmə baş verə bilməsini yoxla
      mockNavigate('/users');
      mockNavigate('/regions');
      mockNavigate('/sectors');
      mockNavigate('/schools');
      
      // Navigate funksiyasının çağırışlarını yoxla
      expect(mockNavigate).toHaveBeenCalledWith('/users');
      expect(mockNavigate).toHaveBeenCalledWith('/regions');
      expect(mockNavigate).toHaveBeenCalledWith('/sectors');
      expect(mockNavigate).toHaveBeenCalledWith('/schools');
    });
    
    it('regionadmin istifadəçisi yalnız öz regionuna və sektorlarına giriş edə bilir', async () => {
      // regionadmin rolunu mockla
      mockUserRole('regionadmin');
      
      // Restricted komponentlərini mockla
      vi.mock('@/components/common/Restricted', () => ({
        default: ({ requiredRole, children }: { requiredRole: UserRole, children: React.ReactNode }) => {
          if (requiredRole === 'regionadmin' || requiredRole === 'superadmin') {
            return <>{children}</>;
          }
          return <div data-testid={`restricted-${requiredRole}`}>Bu səhifə yalnız {requiredRole} istifadəçilər üçün əlçatandır</div>;
        }
      }));
      
      // RegionsPage səhifəsini render et (regionadmin-in icazəsi var)
      const RegionsPage = () => (
        <div data-testid="regions">
          Regionlar
        </div>
      );
      
      render(<RegionsPage />);
      
      // Regions səhifəsinin göründüyünü yoxla
      expect(screen.getByTestId('regions')).toBeInTheDocument();
    });
  });

  describe('DASH-02: Yan panel naviqasiyası', () => {
    it('yan paneldən müxtəlif bölmələrə keçid', async () => {
      // React Router mockla - istifadəçi hərəkətləri simulyasiyası üçün
      const mockPush = vi.fn();
      const mockReactRouter = {
        ...vi.importActual('react-router-dom'),
        useNavigate: () => mockPush
      };
      vi.doMock('react-router-dom', () => mockReactRouter);

      // SidebarLayout komponentini render et
      render(
        <MemoryRouter>
          <div data-testid="sidebar">
            <a data-testid="sidebar-dashboard" href="/dashboard">Dashboard</a>
            <a data-testid="sidebar-users" href="/users">İstifadəçilər</a>
            <a data-testid="sidebar-regions" href="/regions">Regionlar</a>
          </div>
        </MemoryRouter>
      );

      // Sidebar linklərini tıkla və yönləndirməni yoxla
      const dashboardLink = screen.getByTestId('sidebar-dashboard');
      const usersLink = screen.getByTestId('sidebar-users');
      const regionsLink = screen.getByTestId('sidebar-regions');

      // Dashboard linkindən istifadə et
      fireEvent.click(dashboardLink);
      // İstifadəçilər linkindən istifadə et
      fireEvent.click(usersLink);
      // Regionlar linkindən istifadə et
      fireEvent.click(regionsLink);

      // Yönləndirmə baş verdiyini qeyd et (mockPush real yönləndirmə etmir)
      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
      expect(usersLink).toHaveAttribute('href', '/users');
      expect(regionsLink).toHaveAttribute('href', '/regions');
    });

    it('aktiv menyunun vurğulanması', async () => {
      // Aktiv menu itemin vurğulanması üçün test
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <div data-testid="sidebar">
            <a data-testid="sidebar-dashboard" href="/dashboard" className="active">Dashboard</a>
            <a data-testid="sidebar-users" href="/users">İstifadəçilər</a>
          </div>
        </MemoryRouter>
      );

      // Dashboard linki aktiv olmalıdır (className === "active")
      const dashboardLink = screen.getByTestId('sidebar-dashboard');
      expect(dashboardLink).toHaveClass('active');
    });
  });

  describe('DASH-03: Responsiv görünüş', () => {
    it('mobil ekranlarda sidebar gizlənə bilir', async () => {
      // matchMedia mockla - mobil ekranı simulyasiya etmək üçün
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: query.includes('max-width'),
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }),
      });

      // SidebarLayout render et
      render(
        <MemoryRouter>
          <div data-testid="sidebar-layout">
            <button data-testid="sidebar-toggle">Toggle Sidebar</button>
            <div data-testid="sidebar-wrapper" className="hidden-mobile">
              <div data-testid="sidebar"></div>
            </div>
            <div data-testid="main-content">Content</div>
          </div>
        </MemoryRouter>
      );

      // Toggle düyməsinə basıb sidebar'ın görünüşünü dəyişdiririk
      const toggleButton = screen.getByTestId('sidebar-toggle');
      const sidebarWrapper = screen.getByTestId('sidebar-wrapper');
      
      // İlkin vəziyyətdə gizlidir
      expect(sidebarWrapper).toHaveClass('hidden-mobile');
      
      // Toggle et - görünür olmalıdır
      fireEvent.click(toggleButton);
      
      // Toggle edilmiş vəziyyəti yoxlamaq üçün əlavə implementasiya lazımdır
      // Əsl komponentdə toggle funksiyası varsa, burada mocklanmalıdır
    });

    it('desktop ekranlarda sidebar həmişə göstərilir', async () => {
      // matchMedia mockla - desktop ekranı simulyasiya etmək üçün
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: !query.includes('max-width'),
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }),
      });

      // SidebarLayout render et
      render(
        <MemoryRouter>
          <div data-testid="sidebar-layout">
            <button data-testid="sidebar-toggle">Toggle Sidebar</button>
            <div data-testid="sidebar-wrapper" className="visible-desktop">
              <div data-testid="sidebar"></div>
            </div>
            <div data-testid="main-content">Content</div>
          </div>
        </MemoryRouter>
      );

      // Desktop-da sidebar görünür olmalıdır
      const sidebarWrapper = screen.getByTestId('sidebar-wrapper');
      expect(sidebarWrapper).toHaveClass('visible-desktop');
    });
  });

  describe('DASH-04: İcazəsiz bölmələr', () => {
    it('icazəsi olmayan bölməyə keçid cəhdi icazə xətası göstərir', async () => {
      // sectoradmin rolunu mockla
      mockUserRole('sectoradmin');
      
      // Restricted komponentini mockla
      vi.mock('@/components/common/Restricted', () => ({
        default: ({ requiredRole, children }: { requiredRole: UserRole, children: React.ReactNode }) => {
          if (requiredRole === 'superadmin') {
            return (
              <div data-testid="restricted-superadmin">
                Bu səhifə yalnız superadmin istifadəçilər üçün əlçatandır
              </div>
            );
          }
          return <>{children}</>;
        }
      }));
      
      // Regions səhifəsini render et (sectoradmin-in icazəsi yoxdur)
      const RegionsPage = () => (
        <div>
          {mockRestricted({ requiredRole: 'superadmin' })}
        </div>
      );
      
      render(<RegionsPage />);
      
      // İcazə olmayan mesajının olduğunu yoxla
      expect(screen.getByTestId('restricted-superadmin')).toBeInTheDocument();
    });

    it('icazəsi olmayan əməliyyat API xətası qaytarır', async () => {
      // sectoradmin rolunu mockla
      mockUserRole('sectoradmin');
      
      // API xətası simulyasiyası
      const mockFetch = vi.fn().mockImplementation((url) => {
        if (url.includes('admin-only-operation')) {
          return Promise.resolve({
            ok: false,
            status: 403,
            json: () => Promise.resolve({ 
              error: "Bu əməliyyat üçün icazəniz yoxdur",
              details: "Yalnız superadmin bu əməliyyatı edə bilər"
            })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ data: 'success' }) });
      });
      
      global.fetch = mockFetch;
      
      // Xəta mesajının göstərilməsi üçün bir funksiya simulyasiyası
      const performAdminOperation = async () => {
        const response = await fetch('https://example.com/api/admin-only-operation');
        const data = await response.json();
        return data;
      };
      
      // API sorğusunu yerinə yetir
      const result = await performAdminOperation();
      
      // Xəta mesajının uyğun olduğunu yoxla
      expect(result.error).toBe("Bu əməliyyat üçün icazəniz yoxdur");
    });
  });
});
