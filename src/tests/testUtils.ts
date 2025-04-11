
import { vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';

// Mock response yaratmaq üçün helper funksiya
export function createSupabaseMockResponse(data: any, error = null) {
  return {
    data,
    error
  };
}

// Test wrapper'lar üçün helper funksiyalar
export function mockAuthContext() {
  return {
    isAuthenticated: true,
    isLoading: false,
    user: {
      id: '1',
      email: 'superadmin@test.com',
      role: 'superadmin'
    },
    login: vi.fn().mockResolvedValue(true),
    logout: vi.fn().mockResolvedValue(true),
    error: null
  };
}

// Ümumi test wrapper yaratmaq üçün funksiya
export function createTestWrapper(Provider: React.ComponentType<{children: ReactNode}>) {
  return ({ children }: { children: ReactNode }) => (
    <Provider>{children}</Provider>
  );
}

// Hook-ları test etmək üçün wrapper yaratmaq üçün funksiya
export function renderHookWithProviders<T>(
  hook: () => T,
  { wrapper }: { wrapper: React.ComponentType<{children: ReactNode}> }
) {
  return renderHook(hook, { wrapper });
}
