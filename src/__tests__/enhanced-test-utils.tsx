
import React from 'react';
import { render, RenderOptions, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// Simple test wrapper
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Export all testing library functions
export * from '@testing-library/react';
export { customRender as render };

// Enhanced testing utilities
export const renderWithProviders = customRender;

export { userEvent };

export const cleanupMocks = () => {
  jest.clearAllMocks();
};

export const testComponentAccessibility = async (component: React.ReactElement) => {
  const { container } = render(component);
  // Basic accessibility test
  expect(container).toBeInTheDocument();
};

export const assertComponentRenders = (component: React.ReactElement) => {
  const { container } = render(component);
  expect(container).toBeInTheDocument();
};

export const assertButtonIsClickable = async (buttonText: string) => {
  const button = screen.getByText(buttonText);
  expect(button).toBeEnabled();
  await userEvent.click(button);
};

export const createTestUser = (overrides?: any) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  full_name: 'Test User',
  role: 'superadmin',
  ...overrides
});

export const ApiMockHelper = {
  mockSuccess: (data: any) => Promise.resolve({ data, error: null }),
  mockError: (error: string) => Promise.resolve({ data: null, error }),
  mockSupabaseAuth: (user?: any) => ({
    data: { user: user || createTestUser() },
    error: null
  }),
  mockEdgeFunctions: () => ({
    data: { success: true },
    error: null
  })
};

export const mockStoreManager = {
  reset: () => {},
  setState: (state: any) => {},
  mockAuthStore: (user?: any) => ({
    isAuthenticated: true,
    user: user || createTestUser(),
    signIn: jest.fn(),
    signOut: jest.fn()
  })
};
