
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './context/auth/AuthProvider';
import { ReportProvider } from './context/ReportContext';
import { NotificationProvider } from './context/NotificationContext';
import { DeadlineProvider } from './context/DeadlineContext';

// window.matchMedia üçün mock
if (!window.matchMedia) {
  window.matchMedia = function (query) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    };
  };
}

// Performance API mock
if (!window.performance) {
  window.performance = {
    now: () => Date.now(),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn(),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn(),
  };
}

// LocalStorage mock
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Default auth state
const mockAuthState = {
  user: {
    id: 'test-user-id',
    role: 'superadmin',
    email: 'test@example.com'
  },
  isAuthenticated: true,
  isLoading: false,
  error: null
};

// Test wrapper komponenti
export const createTestWrapper = (initialAuthState = mockAuthState) => {
  return ({ children }) => (
    <AuthProvider initialState={initialAuthState}>
      <MemoryRouter>
        <NotificationProvider>
          <DeadlineProvider>
            <ReportProvider>
              {children}
            </ReportProvider>
          </DeadlineProvider>
        </NotificationProvider>
      </MemoryRouter>
    </AuthProvider>
  );
};

// Custom render metodu
const customRender = (ui, options = {}) => {
  return render(ui, {
    wrapper: ({ children }) => createTestWrapper()({ children }),
    ...options,
  });
};

// Re-export testing utilities
export * from '@testing-library/react';
export { customRender as render };
export { vi };

// Global beforeEach
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});
