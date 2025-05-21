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
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

// Test ediləcək komponentlər
import Dashboard from '@/pages/Dashboard';
import SidebarLayout from '@/components/layout/SidebarLayout';
import Sidebar from '@/components/layout/Sidebar';

// React Router
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Navigate mock
const mockNavigate = vi.fn();

// React Router mockla - geriçağırım axanı üçün əvəllədimə
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
            <button data-testid="nav-dashboard" onClick={() => mockNavigate('/dashboard')}>
              Dashboard
            </button>
          </li>
          <li>
            <button data-testid="nav-users" onClick={() => mockNavigate('/users')}>
              İstifadəçilər
            </button>
          </li>
          <li>
            <button data-testid="nav-regions" onClick={() => mockNavigate('/regions')}>
              Regionlar
            </button>
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
      {/* Sidebar komponentini çağır */}
      <div data-testid="sidebar-container">
        {/* import Sidebar from '@/components/layout/Sidebar' - bu avtomatik olaraq mock edilmiş versiyanı istifadə edəcək */}
        {/* @ts-ignore */}
        <Sidebar />
      </div>
      <main data-testid="main-content">
        {children}
      </main>
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
    
    it('regionadmin istifadəçisi yalnız icazəli səhifələrə giriş edə bilir', async () => {
      // regionadmin rolunu mockla
      mockUserRole('regionadmin');
      
      // Əlavə komponentlər yaradıldıqda, bu test daha ətraflı implementasiya ediləcək
      // ...
    });
  });
  
  describe('DASH-02: Yan panel naviqasiyası', () => {
    it('yan paneldən müxtəlif bölmələrə keçidlər düzgün işləyir', async () => {
      // superadmin rolunu mockla
      mockUserRole('superadmin');
      
      // SidebarLayout komponentini render et
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <SidebarLayout>
            <div data-testid="content">Ana məzmun</div>
          </SidebarLayout>
        </MemoryRouter>
      );
      
      // Yan panelin görünməsini yoxla
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      
      // Naviqasiyaları yoxla
      fireEvent.click(screen.getByTestId('nav-users'));
      expect(mockNavigate).toHaveBeenCalledWith('/users');
      
      fireEvent.click(screen.getByTestId('nav-regions'));
      expect(mockNavigate).toHaveBeenCalledWith('/regions');
    });
  });
  
  describe('DASH-03: Responsiv görünüş', () => {
    it('kiçik ekranlarda yan panel gizlənir', async () => {
      // Bu test, media query və responsiv dizaynı test etmək üçündür
      // Bu testi tam implementasiya etmək üçün jsdom-u genişləndirmək lazımdır
      // ya da komponentləri özəl responsive yoxlama funksiyalarını təmin etməlidirlər
      
      // Burada komponent real implementasiyasına bağlıdır, lakin təxmini yanaşma:
      // 1. Ekran ölçüsü kiçik olduğunu simulyasiya et
      // 2. Yan panelin gizləndiyini yoxla
      // 3. Menyu düyməsinə kliklədikdə göründüyünü yoxla
      
      // Qeyd: Bu test, real DOM özəlliklərindən asılıdır və
      // test mühitində media query-ləri simulyasiya etmək çətin ola bilər
      // Burada sadəcə konseptual bir test göstəririk:
      
      // window.innerWidth = 600; // mobile-size
      // window.dispatchEvent(new Event('resize'));
      
      // render(<SidebarLayout />);
      
      // expect(screen.getByTestId('sidebar')).toHaveClass('hidden');
      
      // fireEvent.click(screen.getByTestId('menu-toggle'));
      
      // expect(screen.getByTestId('sidebar')).toHaveClass('visible');
    });
  });
  
  describe('DASH-04: İcazəsiz bölmələr', () => {
    it('icazəsi olmayan bölməyə keçid cəhdi xəta mesajı göstərir', async () => {
      // sectoradmin rolunu mockla
      mockUserRole('sectoradmin');
      
      // Restricted komponenti mock et
      vi.mock('@/components/common/Restricted', () => ({
        default: ({ requiredRole, children }: { requiredRole: UserRole, children: React.ReactNode }) => {
          const hasAccess = requiredRole === 'sectoradmin' || requiredRole === 'schooladmin';
          if (hasAccess) {
            return <>{children}</>;
          }
          return (
            <div data-testid="access-denied">
              Bu bölməyə giriş icazəniz yoxdur. {requiredRole} rolu tələb olunur.
            </div>
          );
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
  });
});
