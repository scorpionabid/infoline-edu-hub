import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { UnifiedSectorDataEntry } from './UnifiedSectorDataEntry';

// Mock the auth store
const mockAuthStore = {
  getState: () => ({
    user: { id: '1', role: 'sectoradmin' },
    isAuthenticated: true
  }),
  subscribe: vi.fn(),
  destroy: vi.fn()
};

vi.mock('@/hooks/auth/useAuthStore', () => ({
  useAuthStore: mockAuthStore
}));

describe('UnifiedSectorDataEntry', () => {
  it('renders without crashing', () => {
    render(<UnifiedSectorDataEntry />);
    expect(screen).toBeDefined();
  });

  it('displays the correct heading', () => {
    render(<UnifiedSectorDataEntry />);
    const headingElement = screen.getByText(/Sektor üzrə məlumatların daxil edilməsi/i);
    expect(headingElement).toBeInTheDocument();
  });
});
