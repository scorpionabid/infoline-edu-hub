
import { vi } from 'vitest';

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
    // Cədvəllər üçün mock metodlar
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockReturnThis(),
      match: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
  }),
  functions: {
    invoke: vi.fn().mockImplementation((functionName, { body }) => {
      if (functionName === 'assign-existing-user-as-school-admin') {
        if (!body.userId || !body.schoolId) {
          return Promise.resolve({ 
            data: null, 
            error: { message: 'Missing required parameters' } 
          });
        }
        return Promise.resolve({
          data: {
            success: true,
            user: { id: body.userId },
            school: { id: body.schoolId },
            role: 'schooladmin'
          },
          error: null
        });
      }
      return Promise.resolve({ data: null, error: null });
    })
  }
};
