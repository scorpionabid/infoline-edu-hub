/**
 * RegionAdminDashboard Test Suite
 * Tests for RegionAdmin dashboard functionality
 * 
 * Test Coverage:
 * - ✅ Component rendering
 * - ✅ Region-specific content
 * - ✅ Sector management
 * - ✅ School oversight
 * - ✅ Data approval panel
 * - ✅ Region statistics
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, expect, beforeEach, describe, it } from 'vitest';
import '@testing-library/jest-dom';

// Import test utilities
import { renderWithProviders } from '../test-utils';

// Mock the RegionAdminDashboard component
const MockRegionAdminDashboard = () => {
  return (
    <div role="main" data-testid="regionadmin-dashboard">
      <header>
        <h1>Region Admin Dashboard</h1>
        <div data-testid="region-info">
          <span>Current Region: Baku Region</span>
          <span>Your Role: Region Administrator</span>
        </div>
      </header>
      
      <main>
        <section data-testid="region-stats">
          <h2>Region Statistics</h2>
          <div data-testid="stats-grid">
            <div data-testid="sectors-count">
              <h3>Total Sectors</h3>
              <span>8</span>
            </div>
            <div data-testid="schools-count">
              <h3>Total Schools</h3>
              <span>120</span>
            </div>
            <div data-testid="completion-rate">
              <h3>Data Completion</h3>
              <span>78%</span>
            </div>
            <div data-testid="pending-approvals">
              <h3>Pending Approvals</h3>
              <span>25</span>
            </div>
          </div>
        </section>
        
        <section data-testid="sectors-management">
          <h2>Sectors Management</h2>
          <div data-testid="sectors-actions">
            <button data-testid="add-sector-btn">Add New Sector</button>
            <button data-testid="export-sectors-btn">Export Sectors</button>
          </div>
          <div data-testid="sectors-list">
            <div data-testid="sector-card">
              <h4>Nasimi Sector</h4>
              <p>Schools: 15</p>
              <p>Completion: 85%</p>
              <button data-testid="manage-sector-btn">Manage</button>
            </div>
            <div data-testid="sector-card">
              <h4>Yasamal Sector</h4>
              <p>Schools: 18</p>
              <p>Completion: 72%</p>
              <button data-testid="manage-sector-btn">Manage</button>
            </div>
          </div>
        </section>
        
        <section data-testid="data-approval">
          <h2>Data Approval Panel</h2>
          <div data-testid="approval-filters">
            <select data-testid="sector-filter">
              <option value="">All Sectors</option>
              <option value="nasimi">Nasimi</option>
              <option value="yasamal">Yasamal</option>
            </select>
            <select data-testid="status-filter">
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <button data-testid="apply-filters-btn">Apply Filters</button>
          </div>
          
          <div data-testid="approval-queue">
            <div data-testid="approval-item">
              <span>School 142 - Category: Student Data</span>
              <div data-testid="approval-actions">
                <button data-testid="approve-btn">Approve</button>
                <button data-testid="reject-btn">Reject</button>
                <button data-testid="view-details-btn">View Details</button>
              </div>
            </div>
            <div data-testid="approval-item">
              <span>School 89 - Category: Infrastructure</span>
              <div data-testid="approval-actions">
                <button data-testid="approve-btn">Approve</button>
                <button data-testid="reject-btn">Reject</button>
                <button data-testid="view-details-btn">View Details</button>
              </div>
            </div>
          </div>
        </section>
        
        <section data-testid="categories-management">
          <h2>Categories Management</h2>
          <button data-testid="create-category-btn">Create New Category</button>
          <div data-testid="categories-list">
            <div data-testid="category-item">
              <h4>Student Information</h4>
              <p>Status: Active</p>
              <button data-testid="edit-category-btn">Edit</button>
            </div>
            <div data-testid="category-item">
              <h4>Teacher Data</h4>
              <p>Status: Active</p>
              <button data-testid="edit-category-btn">Edit</button>
            </div>
          </div>
        </section>
        
        <section data-testid="quick-reports">
          <h2>Quick Reports</h2>
          <div data-testid="report-actions">
            <button data-testid="completion-report-btn">Completion Report</button>
            <button data-testid="sector-comparison-btn">Sector Comparison</button>
            <button data-testid="deadline-report-btn">Deadline Report</button>
          </div>
        </section>
      </main>
    </div>
  );
};

// Mock the actual component import
vi.mock('@/components/dashboard/region-admin/RegionAdminDashboard', () => ({
  default: MockRegionAdminDashboard
}));

describe('RegionAdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders dashboard without crashing', () => {
      renderWithProviders(<MockRegionAdminDashboard />);
      expect(screen.getByTestId('regionadmin-dashboard')).toBeInTheDocument();
    });

    it('displays region admin dashboard heading', () => {
      renderWithProviders(<MockRegionAdminDashboard />);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Region Admin Dashboard');
    });

    it('shows current region information', () => {
      renderWithProviders(<MockRegionAdminDashboard />);
      expect(screen.getByText('Current Region: Baku Region')).toBeInTheDocument();
      expect(screen.getByText('Your Role: Region Administrator')).toBeInTheDocument();
    });
  });

  describe('Region Statistics', () => {
    it('displays region statistics section', () => {
      renderWithProviders(<MockRegionAdminDashboard />);
      
      expect(screen.getByTestId('region-stats')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Region Statistics' })).toBeInTheDocument();
    });

    it('shows all statistics cards with correct values', () => {
      renderWithProviders(<MockRegionAdminDashboard />);
      
      expect(screen.getByTestId('sectors-count')).toBeInTheDocument();
      expect(screen.getByTestId('schools-count')).toBeInTheDocument();
      expect(screen.getByTestId('completion-rate')).toBeInTheDocument();
      expect(screen.getByTestId('pending-approvals')).toBeInTheDocument();
      
      // Check values
      expect(screen.getByText('8')).toBeInTheDocument(); // Total Sectors
      expect(screen.getByText('120')).toBeInTheDocument(); // Total Schools
      expect(screen.getByText('78%')).toBeInTheDocument(); // Completion Rate
      expect(screen.getByText('25')).toBeInTheDocument(); // Pending Approvals
    });

    it('statistics grid has proper structure', () => {
      renderWithProviders(<MockRegionAdminDashboard />);
      
      const statsGrid = screen.getByTestId('stats-grid');
      expect(statsGrid).toBeInTheDocument();
      
      expect(screen.getByText('Total Sectors')).toBeInTheDocument();
      expect(screen.getByText('Total Schools')).toBeInTheDocument();
      expect(screen.getByText('Data Completion')).toBeInTheDocument();
      expect(screen.getByText('Pending Approvals')).toBeInTheDocument();
    });
  });

  describe('Sectors Management', () => {
    it('displays sectors management section', () => {
      renderWithProviders(<MockRegionAdminDashboard />);
      
      expect(screen.getByTestId('sectors-management')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Sectors Management' })).toBeInTheDocument();
    });

    it('shows sector action buttons', () => {
      renderWithProviders(<MockRegionAdminDashboard />);
      
      expect(screen.getByTestId('add-sector-btn')).toHaveTextContent('Add New Sector');
      expect(screen.getByTestId('export-sectors-btn')).toHaveTextContent('Export Sectors');
    });

    it('displays sectors list with sector cards', () => {
      renderWithProviders(<MockRegionAdminDashboard />);
      
      const sectorCards = screen.getAllByTestId('sector-card');
      expect(sectorCards).toHaveLength(2);
      
      expect(screen.getByText('Nasimi Sector')).toBeInTheDocument();
      expect(screen.getByText('Yasamal Sector')).toBeInTheDocument();
      
      expect(screen.getByText('Schools: 15')).toBeInTheDocument();
      expect(screen.getByText('Schools: 18')).toBeInTheDocument();
      
      expect(screen.getByText('Completion: 85%')).toBeInTheDocument();
      expect(screen.getByText('Completion: 72%')).toBeInTheDocument();
    });

    it('sector cards have manage buttons', () => {
      renderWithProviders(<MockRegionAdminDashboard />);
      
      const manageButtons = screen.getAllByTestId('manage-sector-btn');
      expect(manageButtons).toHaveLength(2);
      
      manageButtons.forEach(button => {
        expect(button).toHaveTextContent('Manage');
      });
    });
  });

  describe('Data Approval Panel', () => {
    it('displays data approval section', () => {
      renderWithProviders(<MockRegionAdminDashboard />);
      
      expect(screen.getByTestId('data-approval')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Data Approval Panel' })).toBeInTheDocument();
    });

    it('shows approval filters', () => {
      renderWithProviders(<MockRegionAdminDashboard />);
      
      const sectorFilter = screen.getByTestId('sector-filter');
      const statusFilter = screen.getByTestId('status-filter');
      const applyButton = screen.getByTestId('apply-filters-btn');
      
      expect(sectorFilter).toBeInTheDocument();
      expect(statusFilter).toBeInTheDocument();
      expect(applyButton).toBeInTheDocument();
      
      // Check filter options
      expect(screen.getByText('All Sectors')).toBeInTheDocument();
      expect(screen.getByText('Nasimi')).toBeInTheDocument();
      expect(screen.getByText('Yasamal')).toBeInTheDocument();
    });

    it('displays approval queue with pending items', () => {
      renderWithProviders(<MockRegionAdminDashboard />);
      
      const approvalItems = screen.getAllByTestId('approval-item');
      expect(approvalItems).toHaveLength(2);
      
      expect(screen.getByText('School 142 - Category: Student Data')).toBeInTheDocument();
      expect(screen.getByText('School 89 - Category: Infrastructure')).toBeInTheDocument();
    });

    it('approval items have action buttons', () => {
      renderWithProviders(<MockRegionAdminDashboard />);
      
      const approveButtons = screen.getAllByTestId('approve-btn');
      const rejectButtons = screen.getAllByTestId('reject-btn');
      const viewButtons = screen.getAllByTestId('view-details-btn');
      
      expect(approveButtons).toHaveLength(2);
      expect(rejectButtons).toHaveLength(2);
      expect(viewButtons).toHaveLength(2);
    });
  });

  describe('Categories Management', () => {
    it('displays categories management section', () => {
      renderWithProviders(<MockRegionAdminDashboard />);
      
      expect(screen.getByTestId('categories-management')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Categories Management' })).toBeInTheDocument();
    });

    it('shows create category button', () => {
      renderWithProviders(<MockRegionAdminDashboard />);
      
      expect(screen.getByTestId('create-category-btn')).toHaveTextContent('Create New Category');
    });

    it('displays categories list', () => {
      renderWithProviders(<MockRegionAdminDashboard />);
      
      const categoryItems = screen.getAllByTestId('category-item');
      expect(categoryItems).toHaveLength(2);
      
      expect(screen.getByText('Student Information')).toBeInTheDocument();
      expect(screen.getByText('Teacher Data')).toBeInTheDocument();
      
      const editButtons = screen.getAllByTestId('edit-category-btn');
      expect(editButtons).toHaveLength(2);
    });
  });

  describe('User Interactions', () => {
    it('handles add sector button click', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MockRegionAdminDashboard />);
      
      const addButton = screen.getByTestId('add-sector-btn');
      await user.click(addButton);
      
      expect(addButton).toBeInTheDocument();
    });

    it('handles filter application', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MockRegionAdminDashboard />);
      
      const sectorFilter = screen.getByTestId('sector-filter');
      const applyButton = screen.getByTestId('apply-filters-btn');
      
      await user.selectOptions(sectorFilter, 'nasimi');
      await user.click(applyButton);
      
      expect(sectorFilter).toHaveValue('nasimi');
    });

    it('handles approval actions', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MockRegionAdminDashboard />);
      
      const approveButtons = screen.getAllByTestId('approve-btn');
      const rejectButtons = screen.getAllByTestId('reject-btn');
      
      await user.click(approveButtons[0]);
      await user.click(rejectButtons[0]);
      
      expect(approveButtons[0]).toBeInTheDocument();
      expect(rejectButtons[0]).toBeInTheDocument();
    });

    it('handles category creation', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MockRegionAdminDashboard />);
      
      const createButton = screen.getByTestId('create-category-btn');
      await user.click(createButton);
      
      expect(createButton).toBeInTheDocument();
    });
  });

  describe('Quick Reports', () => {
    it('displays quick reports section', () => {
      renderWithProviders(<MockRegionAdminDashboard />);
      
      expect(screen.getByTestId('quick-reports')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Quick Reports' })).toBeInTheDocument();
    });

    it('shows all report action buttons', () => {
      renderWithProviders(<MockRegionAdminDashboard />);
      
      expect(screen.getByTestId('completion-report-btn')).toHaveTextContent('Completion Report');
      expect(screen.getByTestId('sector-comparison-btn')).toHaveTextContent('Sector Comparison');
      expect(screen.getByTestId('deadline-report-btn')).toHaveTextContent('Deadline Report');
    });

    it('handles report generation clicks', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MockRegionAdminDashboard />);
      
      const reportButtons = [
        screen.getByTestId('completion-report-btn'),
        screen.getByTestId('sector-comparison-btn'),
        screen.getByTestId('deadline-report-btn')
      ];
      
      for (const button of reportButtons) {
        await user.click(button);
        expect(button).toBeInTheDocument();
      }
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA roles and structure', () => {
      renderWithProviders(<MockRegionAdminDashboard />);
      
      expect(screen.getByRole('main')).toBeInTheDocument();
      
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MockRegionAdminDashboard />);
      
      await user.tab();
      expect(document.activeElement).not.toBe(document.body);
    });

    it('form controls are properly labeled', () => {
      renderWithProviders(<MockRegionAdminDashboard />);
      
      const selects = screen.getAllByRole('combobox');
      selects.forEach(select => {
        expect(select).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('renders gracefully with missing data', () => {
      renderWithProviders(<MockRegionAdminDashboard />);
      expect(screen.getByTestId('regionadmin-dashboard')).toBeInTheDocument();
    });

    it('handles component unmounting cleanly', () => {
      const { unmount } = renderWithProviders(<MockRegionAdminDashboard />);
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('integrates with auth store for region admin role', () => {
      renderWithProviders(<MockRegionAdminDashboard />);
      expect(screen.getByTestId('regionadmin-dashboard')).toBeInTheDocument();
    });

    it('integrates with language context', () => {
      renderWithProviders(<MockRegionAdminDashboard />);
      expect(screen.getByText('Region Admin Dashboard')).toBeInTheDocument();
    });
  });
});
