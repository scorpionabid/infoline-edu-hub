import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSupabaseSchools } from '../hooks/useSupabaseSchools';
import { createTestWrapper } from '../setupTests';
import { createClient } from '@supabase/supabase-js';

// Get mocked Supabase client
const getMockSupabase = () => createClient('http://localhost:54321', 'test-anon-key');

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
      return <div>Test Component</div>;
    };

    render(<TestComponent />, { wrapper: createTestWrapper() });

    await waitFor(() => {
      expect(supabase.auth.getSession).toHaveBeenCalled();
    });
  });
});

describe('Supabase Schools Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('məktəb silinməsi', async () => {
    const mockDelete = vi.fn().mockResolvedValue({ data: null, error: null });
    const supabase = getMockSupabase();
    supabase.from().delete = mockDelete;

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
      expect(mockDelete).toHaveBeenCalled();
    });
  });

  it('xəta halında error state-i yenilənir', async () => {
    const mockError = new Error('Test error');
    const supabase = getMockSupabase();
    supabase.from().delete = vi.fn().mockRejectedValue(mockError);

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