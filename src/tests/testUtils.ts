
import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/auth';
import { LanguageProvider } from '@/context/LanguageContext';
import { QueryClientProvider } from '@/context/QueryClientProvider';
import { vi } from 'vitest';

// Test wraperləri
export const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <QueryClientProvider>
          <BrowserRouter>
            {children}
          </BrowserRouter>
        </QueryClientProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

// Custom render metodu
export const customRender = (ui: React.ReactElement, options = {}) => {
  return render(ui, { wrapper: AllTheProviders, ...options });
};

// matchMedia mock-unu yaradırıq
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    matches: false,
    media: '',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  })),
});

// localStorage mock-unu yaradırıq
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn().mockImplementation(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true
});

// Re-export testing-library metodları
export * from '@testing-library/react';
export { customRender as render };
