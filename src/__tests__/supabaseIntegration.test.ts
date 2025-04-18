
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider } from '@/context/auth/AuthProvider';
import { LanguageProvider } from '@/context/LanguageContext';
import { BrowserRouter } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Columns from '@/pages/Columns';

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      data: null,
      error: null,
    })),
    storage: {
      from: vi.fn(),
    },
  },
}));

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <AuthProvider supabaseClient={supabase}>
        <LanguageProvider>
          {component}
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Columns Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithProviders(<Columns />);
    expect(screen.getByText(/columns/i)).toBeInTheDocument();
  });

  it('shows add column button for admin users', async () => {
    renderWithProviders(<Columns />);
    const addButton = screen.queryByText(/add column/i);
    expect(addButton).toBeInTheDocument();
  });

  it('opens add column dialog when button is clicked', async () => {
    renderWithProviders(<Columns />);
    const addButton = screen.getByText(/add column/i);
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByText(/add new column/i)).toBeInTheDocument();
    });
  });
});
