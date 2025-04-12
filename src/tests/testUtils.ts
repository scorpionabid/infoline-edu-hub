
import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/auth';
import { LanguageProvider } from '@/context/LanguageContext';
import { QueryClientProvider } from '@/context/QueryClientProvider';

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

// Re-export testing-library metodları
export * from '@testing-library/react';
export { customRender as render };
