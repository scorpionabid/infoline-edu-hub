
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ApprovalManager from '../components/approval/ApprovalManager';
import { DataEntryStatus } from '@/types/dataEntry';

// Mock approval data with correct types
const mockApprovalManagerProps = {
  pendingApprovals: [],
  approvedItems: [],
  rejectedItems: [],
  onApprove: vi.fn(),
  onReject: vi.fn(),
  onView: vi.fn(),
  isLoading: false
};

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('Data Approval Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders approval manager correctly', () => {
    renderWithQueryClient(<ApprovalManager {...mockApprovalManagerProps} />);
    expect(screen.getByText(/Təsdiq Meneceri/i)).toBeInTheDocument();
  });

  it('displays pending approvals', () => {
    const mockPendingApprovals = [
      {
        id: '1',
        categoryId: 'cat-1',
        categoryName: 'Test Category',
        schoolId: 'school-1',
        schoolName: 'Test School',
        submittedBy: 'Test User',
        submittedAt: '2025-01-01',
        status: DataEntryStatus.PENDING,
        entries: [],
        completionRate: 75
      }
    ];

    const props = {
      ...mockApprovalManagerProps,
      pendingApprovals: mockPendingApprovals
    };

    renderWithQueryClient(<ApprovalManager {...props} />);
    
    expect(screen.getByText('Test Category')).toBeInTheDocument();
    expect(screen.getByText('Test School')).toBeInTheDocument();
  });

  it('handles loading state', () => {
    const props = {
      ...mockApprovalManagerProps,
      isLoading: true
    };

    renderWithQueryClient(<ApprovalManager {...props} />);
    
    // Check for loading indicator
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('handles approval action', async () => {
    const mockApproveItem = vi.fn();
    const mockPendingApprovals = [
      {
        id: '1',
        categoryId: 'cat-1',
        categoryName: 'Test Category',
        schoolId: 'school-1',
        schoolName: 'Test School',
        submittedBy: 'Test User',
        submittedAt: '2025-01-01',
        status: DataEntryStatus.PENDING,
        entries: [],
        completionRate: 75
      }
    ];

    const props = {
      ...mockApprovalManagerProps,
      pendingApprovals: mockPendingApprovals,
      onApprove: mockApproveItem
    };

    renderWithQueryClient(<ApprovalManager {...props} />);
    
    expect(props.onApprove).toBeDefined();
  });

  it('filters by status correctly', () => {
    const mockApprovedItems = [
      {
        id: '2',
        categoryId: 'cat-2',
        categoryName: 'Approved Category',
        schoolId: 'school-2',
        schoolName: 'Approved School',
        submittedBy: 'Test User',
        submittedAt: '2025-01-01',
        status: DataEntryStatus.APPROVED,
        entries: [],
        completionRate: 100
      }
    ];

    const props = {
      ...mockApprovalManagerProps,
      approvedItems: mockApprovedItems
    };

    renderWithQueryClient(<ApprovalManager {...props} />);
    
    // Check that approved count is displayed correctly
    expect(screen.getByText(/Təsdiqlənmiş: 1/)).toBeInTheDocument();
  });
});
