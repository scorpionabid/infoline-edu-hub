
import { render, RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { NotificationProvider } from '@/context/NotificationContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/auth';
import { ThemeProvider } from '@/context/ThemeContext';

interface RenderWithProvidersOptions {
  initialEntries?: string[];
  queryClient?: QueryClient;
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: RenderWithProvidersOptions = {}
): RenderResult {
  const {
    initialEntries = ['/'],
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: Infinity,
        },
      },
    }),
  } = options;

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <AuthProvider>
          <LanguageProvider>
            <ThemeProvider>
              <NotificationProvider>
                {ui}
              </NotificationProvider>
            </ThemeProvider>
          </LanguageProvider>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}
