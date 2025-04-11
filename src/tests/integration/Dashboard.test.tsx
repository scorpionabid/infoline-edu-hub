
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/auth/AuthProvider';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { AppQueryProvider } from '@/context/QueryClientProvider';
import Dashboard from '@/pages/Dashboard';
import { supabase } from '@/integrations/supabase/client';

// Mock dashboard data
const mockDashboardData = {
  regions: 5,
  sectors: 20,
  schools: 150,
  users: 300,
  completionRate: 78,
  pendingApprovals: 12,
  notifications: []
};

// Supabase mock
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { role: 'superadmin' }, error: null }),
    rpc: vi.fn().mockImplementation((func) => {
      if (func === 'get_dashboard_stats') {
        return {
          data: mockDashboardData,
          error: null
        };
      }
      return { data: null, error: null };
    }),
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            user: { id: '1', email: 'superadmin@test.com' }
          }
        }
      }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
    }
  }
}));

// Hook mock
vi.mock('@/hooks/useRealDashboardData', () => ({
  useRealDashboardData: () => ({
    dashboardData: mockDashboardData,
    chartData: {
      activityData: [],
      regionSchoolsData: [],
      categoryCompletionData: []
    },
    isLoading: false,
    error: null
  })
}));

// Test wrapper
const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AppQueryProvider>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </AppQueryProvider>
  </BrowserRouter>
);

describe('Dashboard integration', () => {
  it('renders dashboard with correct statistics', async () => {
    render(<Dashboard />, { wrapper: AllProviders });
    
    // Dashboard komponentlərinin yüklənməsini gözlə
    await waitFor(() => {
      // Dashboard hissələrinin mövcudluğunu yoxla
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      
      // Statistika bölməsinin mövcudluğunu yoxla
      const statElements = screen.getAllByTestId(/stat-card/i);
      expect(statElements.length).toBeGreaterThan(0);
    });
  });
});
