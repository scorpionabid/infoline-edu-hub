
import { afterEach, beforeAll, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

// MSW serveri quraşdır
export const server = setupServer(...handlers);

// Hər testin əvvəlində serveri başlat
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Hər testin sonrası React DOM-u təmizlə və handler-ları sıfırla
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

// Bütün testlər bitdikdən sonra serveri bağla
afterAll(() => server.close());

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Köhnə versiya üçün
    removeListener: vi.fn(), // Köhnə versiya üçün
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true
});