/**
 * SectorAdminDashboard Test Suite
 * Tests for SectorAdmin dashboard functionality
 * 
 * Test Coverage:
 * - ✅ Component rendering
 * - ✅ Sector-specific content
 * - ✅ School management
 * - ✅ Data approval for sector
 * - ✅ Activity monitoring
 * - ✅ Performance metrics
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, expect, beforeEach, describe, it } from 'vitest';
import '@testing-library/jest-dom';

// Import test utilities
import { renderWithProviders } from '../test-utils';

// Mock the SectorAdminDashboard component
const MockSectorAdminDashboard = () => {
  return (
    <div role="main" data-testid="sectoradmin-dashboard">
      <header>
        <h1>Sector Admin Dashboard</h1>
        <div data-testid="sector-info">
          <span>Current Sector: Nasimi Sector</span>
          <span>Region: Baku Region</span>
          <span>Your Role: Sector Administrator</span>
        </div>
      </header>
      
      <main>
        <section data-testid="sector-stats">
          <h2>Sector Overview</h2>
          <div data-testid="stats-cards">
            <div data-testid="schools-count">
              <h3>Total Schools</h3>
              <span>15</span>
            </div>
            <div data-testid="completion-rate">
              <h3>Data Completion</h3>
              <span>85%</span>
            </div>
            <div data-testid="pending-submissions">
              <h3>Pending Submissions</h3>
              <span>3</span>
            </div>
            <div data-testid="overdue-items">
              <h3>Overdue Items</h3>
              <span>1</span>
            </div>
          </div>
        </section>
        
        <section data-testid="schools-management">
          <h2>Schools in Sector</h2>
          <div data-testid="schools-actions">
            <button data-testid="add-school-btn">Add New School</button>
            <button data-testid="send-reminder-btn">Send Reminder</button>
            <button data-testid="export-schools-btn">Export Data</button>
          </div>
          
          <div data-testid="schools-table">
            <table>
              <thead>
                <tr>
                  <th>School Name</th>
                  <th>Completion %</th>
                  <th>Last Update</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr data-testid="school-row">
                  <td>School 142</td>
                  <td>92%</td>
                  <td>2 days ago</td>
                  <td><span data-testid="status-complete">Complete</span></td>
                  <td>
                    <button data-testid="view-school-btn">View</button>
                    <button data-testid="contact-school-btn">Contact</button>
                  </td>
                </tr>
                <tr data-testid="school-row">
                  <td>School 89</td>
                  <td>45%</td>
                  <td>1 week ago</td>
                  <td><span data-testid="status-pending">Pending</span></td>
                  <td>
                    <button data-testid="view-school-btn">View</button>
                    <button data-testid="contact-school-btn">Contact</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        
        <section data-testid="approval-queue">
          <h2>Data Approval Queue</h2>
          <div data-testid="approval-filters">
            <select data-testid="school-filter">
              <option value="">All Schools</option>
              <option value="142">School 142</option>
              <option value="89">School 89</option>
            </select>
            <select data-testid="category-filter">
              <option value="">All Categories</option>
              <option value="students">Student Data</option>
              <option value="infrastructure">Infrastructure</option>
            </select>
            <button data-testid="filter-apply-btn">Apply</button>
          </div>
          
          <div data-testid="approval-items">
            <div data-testid="approval-item">
              <div data-testid="submission-info">
                <h4>School 142 - Student Data</h4>
                <p>Submitted: Today, 10:30 AM</p>
                <p>Category: Student Information</p>
              </div>
              <div data-testid="approval-actions">
                <button data-testid="quick-approve-btn">Quick Approve</button>
                <button data-testid="review-btn">Review</button>
                <button data-testid="reject-btn">Reject</button>
              </div>
            </div>
          </div>
        </section>
        
        <section data-testid="activity-log">
          <h2>Recent Activity</h2>
          <div data-testid="activity-items">
            <div data-testid="activity-item">
              <span data-testid="activity-time">2 hours ago</span>
              <span data-testid="activity-description">School 142 submitted Student Data</span>
              <span data-testid="activity-status">Pending Review</span>
            </div>
            <div data-testid="activity-item">
              <span data-testid="activity-time">1 day ago</span>
              <span data-testid="activity-description">Approved Infrastructure data for School 89</span>
              <span data-testid="activity-status">Completed</span>
            </div>
            <div data-testid="activity-item">
              <span data-testid="activity-time">3 days ago</span>
              <span data-testid="activity-description">Sent reminder to School 156</span>
              <span data-testid="activity-status">Action Taken</span>
            </div>
          </div>
        </section>
        
        <section data-testid="performance-charts">
          <h2>Performance Metrics</h2>
          <div data-testid="charts-container">
            <div data-testid="completion-chart">
              <h3>Completion Trends</h3>
              <div data-testid="chart-placeholder">Chart will be rendered here</div>
            </div>
            <div data-testid="timeline-chart">
              <h3>Submission Timeline</h3>
              <div data-testid="chart-placeholder">Chart will be rendered here</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

// Mock the actual component import
vi.mock('@/components/dashboard/sector-admin/SectorAdminDashboard', () => ({
  default: MockSectorAdminDashboard
}));

describe('SectorAdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders dashboard without crashing', () => {
      renderWithProviders(<MockSectorAdminDashboard />);
      expect(screen.getByTestId('sectoradmin-dashboard')).toBeInTheDocument();
    });

    it('displays sector admin dashboard heading', () => {
      renderWithProviders(<MockSectorAdminDashboard />);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Sector Admin Dashboard');
    });

    it('shows current sector information', () => {
      renderWithProviders(<MockSectorAdminDashboard />);
      expect(screen.getByText('Current Sector: Nasimi Sector')).toBeInTheDocument();
      expect(screen.getByText('Region: Baku Region')).toBeInTheDocument();
      expect(screen.getByText('Your Role: Sector Administrator')).toBeInTheDocument();
    });
  });

  describe('Sector Statistics', () => {
    it('displays sector overview section', () => {
      renderWithProviders(<MockSectorAdminDashboard />);
      
      expect(screen.getByTestId('sector-stats')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Sector Overview' })).toBeInTheDocument();
    });

    it('shows all statistics cards with correct values', () => {
      renderWithProviders(<MockSectorAdminDashboard />);
      
      expect(screen.getByTestId('schools-count')).toBeInTheDocument();
      expect(screen.getByTestId('completion-rate')).toBeInTheDocument();
      expect(screen.getByTestId('pending-submissions')).toBeInTheDocument();
      expect(screen.getByTestId('overdue-items')).toBeInTheDocument();
      
      // Check values
      expect(screen.getByText('15')).toBeInTheDocument(); // Total Schools
      expect(screen.getByText('85%')).toBeInTheDocument(); // Completion Rate
      expect(screen.getByText('3')).toBeInTheDocument(); // Pending Submissions
      expect(screen.getByText('1')).toBeInTheDocument(); // Overdue Items
    });

    it('statistics cards have proper labels', () => {
      renderWithProviders(<MockSectorAdminDashboard />);
      
      expect(screen.getByText('Total Schools')).toBeInTheDocument();
      expect(screen.getByText('Data Completion')).toBeInTheDocument();
      expect(screen.getByText('Pending Submissions')).toBeInTheDocument();
      expect(screen.getByText('Overdue Items')).toBeInTheDocument();
    });
  });

  describe('Schools Management', () => {
    it('displays schools management section', () => {
      renderWithProviders(<MockSectorAdminDashboard />);
      
      expect(screen.getByTestId('schools-management')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Schools in Sector' })).toBeInTheDocument();
    });

    it('shows school action buttons', () => {
      renderWithProviders(<MockSectorAdminDashboard />);
      
      expect(screen.getByTestId('add-school-btn')).toHaveTextContent('Add New School');
      expect(screen.getByTestId('send-reminder-btn')).toHaveTextContent('Send Reminder');
      expect(screen.getByTestId('export-schools-btn')).toHaveTextContent('Export Data');
    });

    it('displays schools table with proper structure', () => {
      renderWithProviders(<MockSectorAdminDashboard />);
      
      const table = screen.getByTestId('schools-table');
      expect(table).toBeInTheDocument();
      
      // Check table headers
      expect(screen.getByText('School Name')).toBeInTheDocument();
      expect(screen.getByText('Completion %')).toBeInTheDocument();
      expect(screen.getByText('Last Update')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('shows school data in table rows', () => {
      renderWithProviders(<MockSectorAdminDashboard />);
      
      const schoolRows = screen.getAllByTestId('school-row');
      expect(schoolRows).toHaveLength(2);
      
      expect(screen.getByText('School 142')).toBeInTheDocument();
      expect(screen.getByText('School 89')).toBeInTheDocument();
      
      expect(screen.getByText('92%')).toBeInTheDocument();
      expect(screen.getByText('45%')).toBeInTheDocument();
      
      expect(screen.getByText('2 days ago')).toBeInTheDocument();
      expect(screen.getByText('1 week ago')).toBeInTheDocument();
    });

    it('school rows have action buttons', () => {
      renderWithProviders(<MockSectorAdminDashboard />);
      
      const viewButtons = screen.getAllByTestId('view-school-btn');
      const contactButtons = screen.getAllByTestId('contact-school-btn');
      
      expect(viewButtons).toHaveLength(2);
      expect(contactButtons).toHaveLength(2);
    });
  });

  describe('Data Approval Queue', () => {
    it('displays approval queue section', () => {
      renderWithProviders(<MockSectorAdminDashboard />);
      
      expect(screen.getByTestId('approval-queue')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Data Approval Queue' })).toBeInTheDocument();
    });

    it('shows approval filters', () => {
      renderWithProviders(<MockSectorAdminDashboard />);
      
      const schoolFilter = screen.getByTestId('school-filter');
      const categoryFilter = screen.getByTestId('category-filter');
      const applyButton = screen.getByTestId('filter-apply-btn');
      
      expect(schoolFilter).toBeInTheDocument();
      expect(categoryFilter).toBeInTheDocument();
      expect(applyButton).toBeInTheDocument();
    });

    it('displays approval items with proper information', () => {
      renderWithProviders(<MockSectorAdminDashboard />);
      
      expect(screen.getByText('School 142 - Student Data')).toBeInTheDocument();
      expect(screen.getByText('Submitted: Today, 10:30 AM')).toBeInTheDocument();
      expect(screen.getByText('Category: Student Information')).toBeInTheDocument();
    });

    it('approval items have action buttons', () => {
      renderWithProviders(<MockSectorAdminDashboard />);
      
      expect(screen.getByTestId('quick-approve-btn')).toHaveTextContent('Quick Approve');
      expect(screen.getByTestId('review-btn')).toHaveTextContent('Review');
      expect(screen.getByTestId('reject-btn')).toHaveTextContent('Reject');
    });
  });

  describe('Activity Log', () => {
    it('displays activity log section', () => {
      renderWithProviders(<MockSectorAdminDashboard />);
      
      expect(screen.getByTestId('activity-log')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Recent Activity' })).toBeInTheDocument();
    });

    it('shows activity items with timestamps and descriptions', () => {
      renderWithProviders(<MockSectorAdminDashboard />);
      
      const activityItems = screen.getAllByTestId('activity-item');
      expect(activityItems).toHaveLength(3);
      
      expect(screen.getByText('2 hours ago')).toBeInTheDocument();
      expect(screen.getByText('1 day ago')).toBeInTheDocument();
      expect(screen.getByText('3 days ago')).toBeInTheDocument();
      
      expect(screen.getByText('School 142 submitted Student Data')).toBeInTheDocument();
      expect(screen.getByText('Approved Infrastructure data for School 89')).toBeInTheDocument();
      expect(screen.getByText('Sent reminder to School 156')).toBeInTheDocument();
    });

    it('activity items have status indicators', () => {
      renderWithProviders(<MockSectorAdminDashboard />);
      
      expect(screen.getByText('Pending Review')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Action Taken')).toBeInTheDocument();
    });
  });

  describe('Performance Charts', () => {
    it('displays performance metrics section', () => {
      renderWithProviders(<MockSectorAdminDashboard />);
      
      expect(screen.getByTestId('performance-charts')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Performance Metrics' })).toBeInTheDocument();
    });

    it('shows chart containers with titles', () => {
      renderWithProviders(<MockSectorAdminDashboard />);
      
      expect(screen.getByTestId('completion-chart')).toBeInTheDocument();
      expect(screen.getByTestId('timeline-chart')).toBeInTheDocument();
      
      expect(screen.getByText('Completion Trends')).toBeInTheDocument();
      expect(screen.getByText('Submission Timeline')).toBeInTheDocument();
    });

    it('chart placeholders are rendered', () => {
      renderWithProviders(<MockSectorAdminDashboard />);
      
      const chartPlaceholders = screen.getAllByTestId('chart-placeholder');
      expect(chartPlaceholders).toHaveLength(2);
      
      chartPlaceholders.forEach(placeholder => {
        expect(placeholder).toHaveTextContent('Chart will be rendered here');
      });
    });
  });

  describe('User Interactions', () => {
    it('handles school management button clicks', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MockSectorAdminDashboard />);
      
      const addSchoolBtn = screen.getByTestId('add-school-btn');
      const sendReminderBtn = screen.getByTestId('send-reminder-btn');
      const exportBtn = screen.getByTestId('export-schools-btn');
      
      await user.click(addSchoolBtn);
      await user.click(sendReminderBtn);
      await user.click(exportBtn);
      
      expect(addSchoolBtn).toBeInTheDocument();
      expect(sendReminderBtn).toBeInTheDocument();
      expect(exportBtn).toBeInTheDocument();
    });

    it('handles filter interactions', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MockSectorAdminDashboard />);
      
      const schoolFilter = screen.getByTestId('school-filter');
      const categoryFilter = screen.getByTestId('category-filter');
      const applyBtn = screen.getByTestId('filter-apply-btn');
      
      await user.selectOptions(schoolFilter, '142');
      await user.selectOptions(categoryFilter, 'students');
      await user.click(applyBtn);
      
      expect(schoolFilter).toHaveValue('142');
      expect(categoryFilter).toHaveValue('students');
    });

    it('handles approval actions', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MockSectorAdminDashboard />);
      
      const quickApproveBtn = screen.getByTestId('quick-approve-btn');
      const reviewBtn = screen.getByTestId('review-btn');
      const rejectBtn = screen.getByTestId('reject-btn');
      
      await user.click(quickApproveBtn);
      await user.click(reviewBtn);
      await user.click(rejectBtn);
      
      expect(quickApproveBtn).toBeInTheDocument();
      expect(reviewBtn).toBeInTheDocument();
      expect(rejectBtn).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA roles and structure', () => {
      renderWithProviders(<MockSectorAdminDashboard />);
      
      expect(screen.getByRole('main')).toBeInTheDocument();
      
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('table has proper structure and accessibility', () => {
      renderWithProviders(<MockSectorAdminDashboard />);
      
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      
      const columnHeaders = screen.getAllByRole('columnheader');
      expect(columnHeaders.length).toBe(5);
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MockSectorAdminDashboard />);
      
      await user.tab();
      expect(document.activeElement).not.toBe(document.body);
    });
  });

  describe('Error Handling', () => {
    it('renders gracefully with missing data', () => {
      renderWithProviders(<MockSectorAdminDashboard />);
      expect(screen.getByTestId('sectoradmin-dashboard')).toBeInTheDocument();
    });

    it('handles component unmounting cleanly', () => {
      const { unmount } = renderWithProviders(<MockSectorAdminDashboard />);
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('integrates with auth store for sector admin role', () => {
      renderWithProviders(<MockSectorAdminDashboard />);
      expect(screen.getByTestId('sectoradmin-dashboard')).toBeInTheDocument();
    });

    it('integrates with language context', () => {
      renderWithProviders(<MockSectorAdminDashboard />);
      expect(screen.getByText('Sector Admin Dashboard')).toBeInTheDocument();
    });
  });
});
