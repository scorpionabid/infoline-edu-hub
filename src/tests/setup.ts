
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
