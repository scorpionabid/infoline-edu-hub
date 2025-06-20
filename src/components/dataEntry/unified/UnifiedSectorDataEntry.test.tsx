import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UnifiedSectorDataEntry } from '../UnifiedSectorDataEntry';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { supabase } from '@/integrations/supabase/client';

// Mock dependencies
jest.mock('@/hooks/auth/useAuthStore');
jest.mock('@/integrations/supabase/client');
jest.mock('@/hooks/use-toast');

const mockUser = {
  id: 'test-user-id',
  role: 'sectoradmin'
};

const mockCategories = [
  {
    id: 'cat-1',
    name: 'Sektor Kateqoriyası',
    description: 'Sektor üçün kateqoriya',
    assignment: 'sectors',
    completion_rate: 75
  },
  {
    id: 'cat-2', 
    name: 'Məktəb Kateqoriyası',
    description: 'Məktəblər üçün kateqoriya',
    assignment: 'all',
    completion_rate: 60
  }
];

const mockColumns = [
  {
    id: 'col-1',
    name: 'Test Sütun',
    type: 'text',
    is_required: true,
    help_text: 'Test üçün köməkçi mətn'
  }
];

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('UnifiedSectorDataEntry', () => {
  beforeEach(() => {
    // Mock auth store
    (useAuthStore as jest.Mock).mockReturnValue(mockUser);
    
    // Mock supabase queries
    const mockSupabaseChain = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis()
    };

    (supabase as any) = mockSupabaseChain;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders category selection by default', async () => {
    // Mock successful categories query
    const mockFrom = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          in: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockCategories,
              error: null
            })
          })
        })
      })
    });
    
    (supabase.from as jest.Mock) = mockFrom;

    renderWithQueryClient(<UnifiedSectorDataEntry />);

    // Should show header
    expect(screen.getByText('Məlumat Daxil Etmə')).toBeInTheDocument();
    expect(screen.getByText('Məlumat daxil etmək istədiyiniz kateqoriyanı seçin')).toBeInTheDocument();

    // Wait for categories to load and display
    await waitFor(() => {
      expect(screen.getByText('Sektor Kateqoriyası')).toBeInTheDocument();
      expect(screen.getByText('Məktəb Kateqoriyası')).toBeInTheDocument();
    });
  });

  test('correctly detects sector category and switches to sector mode', async () => {
    // Mock categories query
    const mockFrom = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          in: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockCategories,
              error: null
            })
          })
        })
      })
    });
    
    (supabase.from as jest.Mock) = mockFrom;

    renderWithQueryClient(<UnifiedSectorDataEntry />);

    await waitFor(() => {
      expect(screen.getByText('Sektor Kateqoriyası')).toBeInTheDocument();
    });

    // Click on sector category
    const sectorCategory = screen.getByText('Sektor Kateqoriyası').closest('div[role="button"], div')?.parentElement;
    if (sectorCategory) {
      fireEvent.click(sectorCategory);
    }

    // Should switch to data entry mode and show sector indicator
    await waitFor(() => {
      expect(screen.getByText('Sektor Məlumatı')).toBeInTheDocument();
      expect(screen.getByText('Bu məlumat birbaşa sektor üçün qeyd ediləcək')).toBeInTheDocument();
    });
  });

  test('correctly detects school category and shows school mode toggle', async () => {
    // Mock categories query
    const mockFrom = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          in: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockCategories,
              error: null
            })
          })
        })
      })
    });
    
    (supabase.from as jest.Mock) = mockFrom;

    renderWithQueryClient(<UnifiedSectorDataEntry />);

    await waitFor(() => {
      expect(screen.getByText('Məktəb Kateqoriyası')).toBeInTheDocument();
    });

    // Click on school category
    const schoolCategory = screen.getByText('Məktəb Kateqoriyası').closest('div[role="button"], div')?.parentElement;
    if (schoolCategory) {
      fireEvent.click(schoolCategory);
    }

    // Should switch to data entry mode and show school mode toggle
    await waitFor(() => {
      expect(screen.getByText('Məktəb Məlumatları')).toBeInTheDocument();
      expect(screen.getByText('Tək məktəb')).toBeInTheDocument();
      expect(screen.getByText('Bulk məktəb')).toBeInTheDocument();
    });
  });

  test('allows switching between single and bulk school modes', async () => {
    // Mock categories query
    const mockFrom = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          in: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockCategories,
              error: null
            })
          })
        })
      })
    });
    
    (supabase.from as jest.Mock) = mockFrom;

    renderWithQueryClient(<UnifiedSectorDataEntry />);

    await waitFor(() => {
      expect(screen.getByText('Məktəb Kateqoriyası')).toBeInTheDocument();
    });

    // Click on school category
    const schoolCategory = screen.getByText('Məktəb Kateqoriyası').closest('div')?.parentElement;
    if (schoolCategory) {
      fireEvent.click(schoolCategory);
    }

    await waitFor(() => {
      expect(screen.getByText('Tək məktəb')).toBeInTheDocument();
    });

    // Switch to bulk mode
    const bulkButton = screen.getByText('Bulk məktəb');
    fireEvent.click(bulkButton);

    // Bulk button should be active
    expect(bulkButton).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  test('shows back button and allows returning to category selection', async () => {
    // Mock categories query
    const mockFrom = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          in: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockCategories,
              error: null
            })
          })
        })
      })
    });
    
    (supabase.from as jest.Mock) = mockFrom;

    renderWithQueryClient(<UnifiedSectorDataEntry />);

    await waitFor(() => {
      expect(screen.getByText('Sektor Kateqoriyası')).toBeInTheDocument();
    });

    // Click on category
    const categoryCard = screen.getByText('Sektor Kateqoriyası').closest('div')?.parentElement;
    if (categoryCard) {
      fireEvent.click(categoryCard);
    }

    // Should show back button
    await waitFor(() => {
      expect(screen.getByText('Geri')).toBeInTheDocument();
    });

    // Click back button
    const backButton = screen.getByText('Geri');
    fireEvent.click(backButton);

    // Should return to category selection
    await waitFor(() => {
      expect(screen.getByText('Məlumat daxil etmək istədiyiniz kateqoriyanı seçin')).toBeInTheDocument();
    });
  });

  test('displays correct assignment badges for categories', async () => {
    // Mock categories query
    const mockFrom = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          in: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockCategories,
              error: null
            })
          })
        })
      })
    });
    
    (supabase.from as jest.Mock) = mockFrom;

    renderWithQueryClient(<UnifiedSectorDataEntry />);

    await waitFor(() => {
      expect(screen.getByText('Sektor üçün')).toBeInTheDocument();
      expect(screen.getByText('Məktəblər üçün')).toBeInTheDocument();
    });
  });

  test('shows progress bars for categories', async () => {
    // Mock categories query
    const mockFrom = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          in: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockCategories,
              error: null
            })
          })
        })
      })
    });
    
    (supabase.from as jest.Mock) = mockFrom;

    renderWithQueryClient(<UnifiedSectorDataEntry />);

    await waitFor(() => {
      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.getByText('60%')).toBeInTheDocument();
      expect(screen.getAllByText('Tamamlanma')).toHaveLength(2);
    });
  });
});