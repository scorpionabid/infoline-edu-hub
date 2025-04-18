
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSupabaseSchools } from '../hooks/useSupabaseSchools';
import { createTestWrapper } from '../setupTests';
import { createClient } from '@supabase/supabase-js';

// Get mocked Supabase client
const getMockSupabase = () => createClient('http://localhost:54321', 'test-anon-key');

// Mock useSupabaseSchools hook
vi.mock('../hooks/useSupabaseSchools', () => ({
  useSupabaseSchools: vi.fn()
}));

describe('Supabase Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uğurlu giriş prosesi', async () => {
    const mockSignIn = vi.fn().mockResolvedValue({
      data: {
        user: {
          id: 'test-id',
          email: 'test@example.com',
          user_metadata: { role: 'superadmin' }
        },
        session: {
          access_token: 'test-token'
        }
      },
      error: null
    });

    const supabase = getMockSupabase();
    supabase.auth.signInWithPassword = mockSignIn;

    const TestComponent = () => {
      return (
        <div>Test Component</div>
      );
    };

    render(<TestComponent />, { wrapper: createTestWrapper() });

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled();
    });
  });

  it('giriş xətası', async () => {
    const mockSignIn = vi.fn().mockRejectedValue(new Error('Invalid credentials'));
    const supabase = getMockSupabase();
    supabase.auth.signInWithPassword = mockSignIn;

    const TestComponent = () => {
      return (
        <div>Test Component</div>
      );
    };

    render(<TestComponent />, { wrapper: createTestWrapper() });

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled();
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});

describe('Supabase Schools Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('məktəb silinməsi', async () => {
    const mockDelete = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockSchoolsHook = {
      deleteSchool: mockDelete,
      error: null
    };

    vi.mocked(useSupabaseSchools).mockReturnValue(mockSchoolsHook);

    const TestComponent = () => {
      const { deleteSchool } = useSupabaseSchools();
      return (
        <button onClick={() => deleteSchool('test-id')}>
          Delete School
        </button>
      );
    };

    render(<TestComponent />, { wrapper: createTestWrapper() });

    const deleteButton = screen.getByText('Delete School');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('test-id');
    });
  });

  it('xəta halında error state-i yenilənir', async () => {
    const mockError = new Error('Test error');
    const mockSchoolsHook = {
      deleteSchool: vi.fn().mockRejectedValue(mockError),
      error: mockError
    };

    vi.mocked(useSupabaseSchools).mockReturnValue(mockSchoolsHook);

    const TestComponent = () => {
      const { deleteSchool, error } = useSupabaseSchools();
      return (
        <div>
          <button onClick={() => deleteSchool('test-id')}>
            Delete School
          </button>
          {error && <div>Error: {error.message}</div>}
        </div>
      );
    };

    render(<TestComponent />, { wrapper: createTestWrapper() });

    const deleteButton = screen.getByText('Delete School');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('Error: Test error')).toBeInTheDocument();
    });
  });
});

