// src/tests/__mocks__/supabase.ts faylı yaradın
import { vi } from 'vitest';
import { mockUsers } from '../mocks/data/users';
// src/tests/__mocks__/supabase.ts faylında bütün mock-ları birləşdirin
export const supabase = {
  auth: {
    getSession: vi.fn().mockResolvedValue({
      data: { session: null },
      error: null
    }),
    getUser: vi.fn().mockResolvedValue({
      data: { user: null },
      error: null
    }),
    signInWithPassword: vi.fn().mockResolvedValue({
      data: {
        user: { id: '1', email: 'superadmin@test.com' },
        session: { access_token: 'mock-token' }
      },
      error: null
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn((callback) => {
      callback('INITIAL_SESSION', null);
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    })
  },
  from: vi.fn().mockImplementation((table) => {
    // Bütün cədvəllər üçün bütün lazımi metodları göstərin
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockReturnThis(),
      match: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue({ data: [], error: null }),
      // ... və sairə
    };
  })
};