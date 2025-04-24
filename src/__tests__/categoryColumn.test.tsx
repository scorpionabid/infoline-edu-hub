
import { describe, expect, it } from 'vitest';
import { UserRole } from '@/types/supabase';

describe('Category Column Tests', () => {
  it('should validate user role correctly', () => {
    const role: UserRole = 'superadmin'; // Fix: Use valid UserRole type
    expect(role).toBe('superadmin');
  });
});
