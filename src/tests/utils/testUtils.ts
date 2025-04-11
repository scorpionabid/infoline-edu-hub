// src/tests/utils/testUtils.ts

import { vi } from 'vitest';

// Mock response yaratmaq üçün helper funksiya
export function createSupabaseMockResponse(data, error = null) {
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