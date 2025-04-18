
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
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    storage: {
      from: vi.fn(),
    },
  },
}));

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider supabaseClient={supabase}>
        <LanguageProvider>{component}</LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Columns Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithProviders(<Columns />);
    expect(screen.getByText(/Sütunlar/i)).toBeInTheDocument();
  });

  it('shows add column button for admin users', async () => {
    renderWithProviders(<Columns />);
    expect(screen.getByText(/Sütun əlavə et/i)).toBeInTheDocument();
  });

  it('opens add column dialog when button is clicked', async () => {
    renderWithProviders(<Columns />);
    const addButton = screen.getByText(/Sütun əlavə et/i);
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Yeni sütun əlavə et/i)).toBeInTheDocument();
    });
  });
});
