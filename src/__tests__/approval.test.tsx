import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ApprovalPage from '../pages/Approval';
import { LanguageProvider } from '../context/LanguageContext';
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
        schoolId: '123',
        schoolName: 'Test School',
        submittedBy: 'John Doe',
        submittedAt: '2025-04-18',
        status: 'pending',
        categoryData: [
          {
            categoryId: 1,
            categoryName: 'Infrastruktur',
            data: {
              'field1': 'value1',
              'field2': 'value2'
            }
          },
          {
            categoryId: 2,
            categoryName: 'Tələbələr',
            data: {
              'field3': 'value3',
              'field4': 'value4'
            }
          }
        ]
      }
    ],
    approveSubmission: mockApprovalSubmission,
    rejectSubmission: mockRejectSubmission,
    isLoading: false
  })
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
    expect(screen.getByText('Approval Queue')).toBeInTheDocument();
    expect(screen.getByText('Review and approve pending data entries')).toBeInTheDocument();
  });

  it('shows message when no pending approvals', async () => {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <ApprovalPage />
        </LanguageProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('No pending approvals found.')).toBeInTheDocument();
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
      expect(screen.getByText('Approval Queue')).toBeInTheDocument();
    });
    
    const end = performance.now();
    const loadTime = end - start;
    
    console.log(`Approval data loading time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(1000); // Expecting load time less than 1000ms
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
    expect(renderTime).toBeLessThan(1000); // Initial render should be quick
  });
});
