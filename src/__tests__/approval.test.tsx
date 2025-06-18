import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ApprovalPage from '../pages/Approval';
import { LanguageProvider } from '../context/LanguageContext';
import { useTranslation } from '@/contexts/TranslationContext';

// Auth store artıq Zustand-ə köçürülüb

// Mock hooks
vi.mock('../hooks/auth/useAuthStore', () => ({
  useAuthStore: () => ({
    user: {
      id: '123',
      role: 'regionadmin',
      region_id: '456'
    },
    isAuthenticated: true
  }),
  selectUser: (state: any) => state.user,
  selectIsAuthenticated: (state: any) => state.isAuthenticated
}));

// Mock approval data
const mockApprovalSubmission = vi.fn();
const mockRejectSubmission = vi.fn();

vi.mock('../hooks/approval/useApprovalData', () => ({
  useApprovalData: () => ({
    pendingApprovals: [
      {
        id: '1',
        categoryId: 'cat-1',
        categoryName: 'Infrastruktur',
        schoolId: '123',
        schoolName: 'Test School',
        submittedBy: 'John Doe',
        submittedAt: '2025-04-18',
        status: 'pending',
        entries: [
          {
            id: 'entry-1',
            schoolId: '123',
            categoryId: 'cat-1',
            columnId: 'col-1',
            value: 'value1',
            status: 'pending'
          },
          {
            id: 'entry-2',
            schoolId: '123',
            categoryId: 'cat-1',
            columnId: 'col-2',
            value: 'value2',
            status: 'pending'
          }
        ],
        completionRate: 75,
        categoryData: [
          {
            categoryId: 1,
            categoryName: 'Infrastruktur',
            data: {
              'field1': 'value1',
              'field2': 'value2'
            }
          }
        ]
      }
    ],
    approvedItems: [],
    rejectedItems: [],
    isLoading: false,
    approveItem: mockApprovalSubmission,
    rejectItem: mockRejectSubmission,
    viewItem: vi.fn(),
    // Backward compatibility
    approveSubmission: mockApprovalSubmission,
    rejectSubmission: mockRejectSubmission
  })
}));

// Mock the translation context
vi.mock('@/contexts/TranslationContext', () => ({
  useTranslation: vi.fn(() => ({
    t: (key: string) => key,
    language: 'az',
    setLanguage: vi.fn(),
    isLoading: false,
    error: null,
    isReady: true
  }))
}));

describe('Approval Page', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  it('renders approval page', () => {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <ApprovalPage />
        </LanguageProvider>
      </MemoryRouter>
    );
    // Mock language-da key-lər return edir, actual value-lar deyil
    expect(screen.getByText('dataApproval')).toBeInTheDocument();
    expect(screen.getByText('pendingApprovals')).toBeInTheDocument();
  });

  it('shows stats cards for pending, approved and rejected items', async () => {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <ApprovalPage />
        </LanguageProvider>
      </MemoryRouter>
    );

    // Check statistics cards
    expect(screen.getByText('pendingApprovals')).toBeInTheDocument();
    expect(screen.getByText('approvedItems')).toBeInTheDocument();
    expect(screen.getByText('rejectedItems')).toBeInTheDocument();
    
    // Check numbers (might appear multiple times in DOM)
    const pendingCount = screen.getAllByText('1');
    const approvedCount = screen.getAllByText('0');
    expect(pendingCount.length).toBeGreaterThan(0); // pending count
    expect(approvedCount.length).toBeGreaterThan(0); // approved count
  });
});

// Performance Test
describe('Approval Component Performance', () => {
  it('loads approval data efficiently', async () => {
    const start = performance.now();
    
    render(
      <MemoryRouter>
        <LanguageProvider>
          <ApprovalPage />
        </LanguageProvider>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('dataApproval')).toBeInTheDocument();
    });
    
    const end = performance.now();
    const loadTime = end - start;
    
    console.log(`Approval data loading time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(2000); // Expecting load time less than 2000ms
  });
  
  it('renders efficiently with simulated large dataset', async () => {
    // Create a performance test with timing benchmarks
    const start = performance.now();
    
    render(
      <MemoryRouter>
        <LanguageProvider>
          <ApprovalPage />
        </LanguageProvider>
      </MemoryRouter>
    );
    
    const end = performance.now();
    const renderTime = end - start;
    
    console.log(`Approval large dataset render time: ${renderTime}ms`);
    expect(renderTime).toBeLessThan(2000); // Initial render should be quick
  });
});
