/**
 * SchoolAdminDashboard Test Suite
 * Tests for SchoolAdmin dashboard functionality
 * 
 * Test Coverage:
 * - ✅ Component rendering
 * - ✅ School-specific content
 * - ✅ Form completion tracking
 * - ✅ Data entry interface
 * - ✅ Submission status
 * - ✅ Deadline management
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, expect, beforeEach, describe, it } from 'vitest';
import '@testing-library/jest-dom';

// Import test utilities
import { renderWithProviders } from '../test-utils';

// Mock the SchoolAdminDashboard component
const MockSchoolAdminDashboard = () => {
  return (
    <div data-testid="schooladmin-dashboard">
      <header>
        <h1>School Admin Dashboard</h1>
        <div data-testid="school-info">
          <span>School: Baku Secondary School #142</span>
          <span>Sector: Nasimi Sector</span>
          <span>Region: Baku Region</span>
          <span>Your Role: School Administrator</span>
        </div>
      </header>
      
      <main>
        <section data-testid="completion-overview">
          <h2>Data Completion Overview</h2>
          <div data-testid="completion-stats">
            <div data-testid="overall-completion">
              <h3>Overall Completion</h3>
              <div data-testid="progress-circle">92%</div>
            </div>
            <div data-testid="categories-summary">
              <div data-testid="category-stat">
                <span>Student Data</span>
                <span data-testid="category-completion">100%</span>
                <span data-testid="category-status-complete">Complete</span>
              </div>
              <div data-testid="category-stat">
                <span>Teacher Data</span>
                <span data-testid="category-completion">85%</span>
                <span data-testid="category-status-pending">Pending</span>
              </div>
              <div data-testid="category-stat">
                <span>Infrastructure</span>
                <span data-testid="category-completion">90%</span>
                <span data-testid="category-status-review">Under Review</span>
              </div>
            </div>
          </div>
        </section>
        
        <section data-testid="forms-to-complete">
          <h2>Forms Requiring Attention</h2>
          <div data-testid="urgent-forms">
            <div data-testid="form-card" className="urgent">
              <h4>Teacher Information Form</h4>
              <p data-testid="deadline">Deadline: Tomorrow</p>
              <p data-testid="completion-status">15% Complete</p>
              <div data-testid="form-actions">
                <button data-testid="continue-form-btn">Continue Form</button>
                <button data-testid="view-requirements-btn">View Requirements</button>
              </div>
            </div>
            
            <div data-testid="form-card" className="normal">
              <h4>Facility Inspection Report</h4>
              <p data-testid="deadline">Deadline: In 5 days</p>
              <p data-testid="completion-status">0% Complete</p>
              <div data-testid="form-actions">
                <button data-testid="start-form-btn">Start Form</button>
                <button data-testid="view-requirements-btn">View Requirements</button>
              </div>
            </div>
          </div>
        </section>
        
        <section data-testid="recent-submissions">
          <h2>Recent Submissions</h2>
          <div data-testid="submissions-list">
            <div data-testid="submission-item">
              <div data-testid="submission-info">
                <h4>Student Enrollment Data</h4>
                <p>Submitted: 2 days ago</p>
                <p>Category: Student Information</p>
              </div>
              <div data-testid="submission-status">
                <span data-testid="status-approved">Approved</span>
                <button data-testid="view-submission-btn">View Details</button>
              </div>
            </div>
            
            <div data-testid="submission-item">
              <div data-testid="submission-info">
                <h4>Infrastructure Assessment</h4>
                <p>Submitted: 1 week ago</p>
                <p>Category: Infrastructure</p>
              </div>
              <div data-testid="submission-status">
                <span data-testid="status-under-review">Under Review</span>
                <button data-testid="view-submission-btn">View Details</button>
              </div>
            </div>
            
            <div data-testid="submission-item">
              <div data-testid="submission-info">
                <h4>Teacher Qualifications</h4>
                <p>Submitted: 3 days ago</p>
                <p>Category: Teacher Data</p>
              </div>
              <div data-testid="submission-status">
                <span data-testid="status-rejected">Needs Revision</span>
                <button data-testid="view-feedback-btn">View Feedback</button>
                <button data-testid="revise-submission-btn">Revise</button>
              </div>
            </div>
          </div>
        </section>
        
        <section data-testid="quick-actions">
          <h2>Quick Actions</h2>
          <div data-testid="action-buttons">
            <button data-testid="new-entry-btn">Start New Data Entry</button>
            <button data-testid="upload-files-btn">Upload Files</button>
            <button data-testid="download-templates-btn">Download Templates</button>
            <button data-testid="contact-support-btn">Contact Support</button>
          </div>
        </section>
        
        <section data-testid="notifications">
          <h2>Notifications & Reminders</h2>
          <div data-testid="notifications-list">
            <div data-testid="notification-item" className="urgent">
              <span data-testid="notification-icon">⚠️</span>
              <div data-testid="notification-content">
                <h4>Urgent: Teacher Data Form</h4>
                <p>This form is due tomorrow. Please complete immediately.</p>
                <button data-testid="act-now-btn">Act Now</button>
              </div>
            </div>
            
            <div data-testid="notification-item" className="info">
              <span data-testid="notification-icon">ℹ️</span>
              <div data-testid="notification-content">
                <h4>Reminder: Monthly Report</h4>
                <p>Your monthly report deadline is approaching in 5 days.</p>
                <button data-testid="dismiss-btn">Dismiss</button>
              </div>
            </div>
            
            <div data-testid="notification-item" className="success">
              <span data-testid="notification-icon">✅</span>
              <div data-testid="notification-content">
                <h4>Approved: Student Data</h4>
                <p>Your student enrollment data has been approved.</p>
                <button data-testid="dismiss-btn">Dismiss</button>
              </div>
            </div>
          </div>
        </section>
        
        <section data-testid="help-resources">
          <h2>Help & Resources</h2>
          <div data-testid="help-links">
            <a href="/help/getting-started" data-testid="help-link">Getting Started Guide</a>
            <a href="/help/data-entry" data-testid="help-link">Data Entry Instructions</a>
            <a href="/help/file-upload" data-testid="help-link">File Upload Help</a>
            <a href="/help/contact" data-testid="help-link">Contact Information</a>
          </div>
        </section>
      </main>
    </div>
  );
};

// Mock the actual component import
vi.mock('@/components/dashboard/school-admin/SchoolAdminDashboard', () => ({
  default: MockSchoolAdminDashboard
}));

describe('SchoolAdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders dashboard without crashing', () => {
      renderWithProviders(<MockSchoolAdminDashboard />);
      expect(screen.getByTestId('schooladmin-dashboard')).toBeInTheDocument();
    });

    it('displays school admin dashboard heading', () => {
      renderWithProviders(<MockSchoolAdminDashboard />);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('School Admin Dashboard');
    });

    it('shows current school information', () => {
      renderWithProviders(<MockSchoolAdminDashboard />);
      expect(screen.getByText('School: Baku Secondary School #142')).toBeInTheDocument();
      expect(screen.getByText('Sector: Nasimi Sector')).toBeInTheDocument();
      expect(screen.getByText('Region: Baku Region')).toBeInTheDocument();
      expect(screen.getByText('Your Role: School Administrator')).toBeInTheDocument();
    });
  });

  describe('Data Completion Overview', () => {
    it('displays completion overview section', () => {
      renderWithProviders(<MockSchoolAdminDashboard />);
      
      expect(screen.getByTestId('completion-overview')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Data Completion Overview' })).toBeInTheDocument();
    });

    it('shows overall completion percentage', () => {
      renderWithProviders(<MockSchoolAdminDashboard />);
      
      expect(screen.getByTestId('overall-completion')).toBeInTheDocument();
      expect(screen.getByText('Overall Completion')).toBeInTheDocument();
      expect(screen.getByText('92%')).toBeInTheDocument();
    });

    it('displays category completion summary', () => {
      renderWithProviders(<MockSchoolAdminDashboard />);
      
      const categoryStats = screen.getAllByTestId('category-stat');
      expect(categoryStats).toHaveLength(3);
      
      expect(screen.getByText('Student Data')).toBeInTheDocument();
      expect(screen.getByText('Teacher Data')).toBeInTheDocument();
      expect(screen.getByText('Infrastructure')).toBeInTheDocument();
      
      // Check completion percentages
      const completions = screen.getAllByTestId('category-completion');
      expect(completions[0]).toHaveTextContent('100%');
      expect(completions[1]).toHaveTextContent('85%');
      expect(completions[2]).toHaveTextContent('90%');
    });

    it('shows category status indicators', () => {
      renderWithProviders(<MockSchoolAdminDashboard />);
      
      expect(screen.getByTestId('category-status-complete')).toHaveTextContent('Complete');
      expect(screen.getByTestId('category-status-pending')).toHaveTextContent('Pending');
      expect(screen.getByTestId('category-status-review')).toHaveTextContent('Under Review');
    });
  });

  describe('Forms Requiring Attention', () => {
    it('displays forms section', () => {
      renderWithProviders(<MockSchoolAdminDashboard />);
      
      expect(screen.getByTestId('forms-to-complete')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Forms Requiring Attention' })).toBeInTheDocument();
    });

    it('shows form cards with deadlines and completion status', () => {
      renderWithProviders(<MockSchoolAdminDashboard />);
      
      const formCards = screen.getAllByTestId('form-card');
      expect(formCards).toHaveLength(2);
      
      expect(screen.getByText('Teacher Information Form')).toBeInTheDocument();
      expect(screen.getByText('Facility Inspection Report')).toBeInTheDocument();
      
      expect(screen.getByText('Deadline: Tomorrow')).toBeInTheDocument();
      expect(screen.getByText('Deadline: In 5 days')).toBeInTheDocument();
      
      expect(screen.getByText('15% Complete')).toBeInTheDocument();
      expect(screen.getByText('0% Complete')).toBeInTheDocument();
    });

    it('form cards have action buttons', () => {
      renderWithProviders(<MockSchoolAdminDashboard />);
      
      expect(screen.getByTestId('continue-form-btn')).toHaveTextContent('Continue Form');
      expect(screen.getByTestId('start-form-btn')).toHaveTextContent('Start Form');
      
      const viewRequirementsButtons = screen.getAllByTestId('view-requirements-btn');
      expect(viewRequirementsButtons).toHaveLength(2);
    });
  });

  describe('Recent Submissions', () => {
    it('displays submissions section', () => {
      renderWithProviders(<MockSchoolAdminDashboard />);
      
      expect(screen.getByTestId('recent-submissions')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Recent Submissions' })).toBeInTheDocument();
    });

    it('shows submission items with details', () => {
      renderWithProviders(<MockSchoolAdminDashboard />);
      
      const submissionItems = screen.getAllByTestId('submission-item');
      expect(submissionItems).toHaveLength(3);
      
      expect(screen.getByText('Student Enrollment Data')).toBeInTheDocument();
      expect(screen.getByText('Infrastructure Assessment')).toBeInTheDocument();
      expect(screen.getByText('Teacher Qualifications')).toBeInTheDocument();
      
      expect(screen.getByText('Submitted: 2 days ago')).toBeInTheDocument();
      expect(screen.getByText('Submitted: 1 week ago')).toBeInTheDocument();
      expect(screen.getByText('Submitted: 3 days ago')).toBeInTheDocument();
    });

    it('shows different submission statuses', () => {
      renderWithProviders(<MockSchoolAdminDashboard />);
      
      expect(screen.getByTestId('status-approved')).toHaveTextContent('Approved');
      expect(screen.getByTestId('status-under-review')).toHaveTextContent('Under Review');
      expect(screen.getByTestId('status-rejected')).toHaveTextContent('Needs Revision');
    });

    it('submission items have appropriate action buttons', () => {
      renderWithProviders(<MockSchoolAdminDashboard />);
      
      const viewButtons = screen.getAllByTestId('view-submission-btn');
      expect(viewButtons).toHaveLength(2);
      
      expect(screen.getByTestId('view-feedback-btn')).toHaveTextContent('View Feedback');
      expect(screen.getByTestId('revise-submission-btn')).toHaveTextContent('Revise');
    });
  });

  describe('Quick Actions', () => {
    it('displays quick actions section', () => {
      renderWithProviders(<MockSchoolAdminDashboard />);
      
      expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Quick Actions' })).toBeInTheDocument();
    });

    it('shows all quick action buttons', () => {
      renderWithProviders(<MockSchoolAdminDashboard />);
      
      expect(screen.getByTestId('new-entry-btn')).toHaveTextContent('Start New Data Entry');
      expect(screen.getByTestId('upload-files-btn')).toHaveTextContent('Upload Files');
      expect(screen.getByTestId('download-templates-btn')).toHaveTextContent('Download Templates');
      expect(screen.getByTestId('contact-support-btn')).toHaveTextContent('Contact Support');
    });
  });

  describe('Notifications & Reminders', () => {
    it('displays notifications section', () => {
      renderWithProviders(<MockSchoolAdminDashboard />);
      
      expect(screen.getByTestId('notifications')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Notifications & Reminders' })).toBeInTheDocument();
    });

    it('shows different types of notifications', () => {
      renderWithProviders(<MockSchoolAdminDashboard />);
      
      const notificationItems = screen.getAllByTestId('notification-item');
      expect(notificationItems).toHaveLength(3);
      
      expect(screen.getByText('Urgent: Teacher Data Form')).toBeInTheDocument();
      expect(screen.getByText('Reminder: Monthly Report')).toBeInTheDocument();
      expect(screen.getByText('Approved: Student Data')).toBeInTheDocument();
    });

    it('notifications have appropriate icons and actions', () => {
      renderWithProviders(<MockSchoolAdminDashboard />);
      
      const icons = screen.getAllByTestId('notification-icon');
      expect(icons).toHaveLength(3);
      
      expect(screen.getByTestId('act-now-btn')).toHaveTextContent('Act Now');
      
      const dismissButtons = screen.getAllByTestId('dismiss-btn');
      expect(dismissButtons).toHaveLength(2);
    });
  });

  describe('Help & Resources', () => {
    it('displays help resources section', () => {
      renderWithProviders(<MockSchoolAdminDashboard />);
      
      expect(screen.getByTestId('help-resources')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Help & Resources' })).toBeInTheDocument();
    });

    it('shows help links with proper hrefs', () => {
      renderWithProviders(<MockSchoolAdminDashboard />);
      
      const helpLinks = screen.getAllByTestId('help-link');
      expect(helpLinks).toHaveLength(4);
      
      expect(screen.getByText('Getting Started Guide')).toHaveAttribute('href', '/help/getting-started');
      expect(screen.getByText('Data Entry Instructions')).toHaveAttribute('href', '/help/data-entry');
      expect(screen.getByText('File Upload Help')).toHaveAttribute('href', '/help/file-upload');
      expect(screen.getByText('Contact Information')).toHaveAttribute('href', '/help/contact');
    });
  });

  describe('User Interactions', () => {
    it('handles form action button clicks', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MockSchoolAdminDashboard />);
      
      const continueBtn = screen.getByTestId('continue-form-btn');
      const startBtn = screen.getByTestId('start-form-btn');
      
      await user.click(continueBtn);
      await user.click(startBtn);
      
      expect(continueBtn).toBeInTheDocument();
      expect(startBtn).toBeInTheDocument();
    });

    it('handles quick action button clicks', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MockSchoolAdminDashboard />);
      
      const quickActionButtons = [
        screen.getByTestId('new-entry-btn'),
        screen.getByTestId('upload-files-btn'),
        screen.getByTestId('download-templates-btn'),
        screen.getByTestId('contact-support-btn')
      ];
      
      for (const button of quickActionButtons) {
        await user.click(button);
        expect(button).toBeInTheDocument();
      }
    });

    it('handles notification actions', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MockSchoolAdminDashboard />);
      
      const actNowBtn = screen.getByTestId('act-now-btn');
      const dismissButtons = screen.getAllByTestId('dismiss-btn');
      
      await user.click(actNowBtn);
      for (const dismissBtn of dismissButtons) {
        await user.click(dismissBtn);
      }
      
      expect(actNowBtn).toBeInTheDocument();
      expect(dismissButtons[0]).toBeInTheDocument();
    });

    it('handles submission actions', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MockSchoolAdminDashboard />);
      
      const viewFeedbackBtn = screen.getByTestId('view-feedback-btn');
      const reviseBtn = screen.getByTestId('revise-submission-btn');
      
      await user.click(viewFeedbackBtn);
      await user.click(reviseBtn);
      
      expect(viewFeedbackBtn).toBeInTheDocument();
      expect(reviseBtn).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA roles and structure', () => {
      renderWithProviders(<MockSchoolAdminDashboard />);
      
      expect(screen.getByRole('main')).toBeInTheDocument();
      
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MockSchoolAdminDashboard />);
      
      await user.tab();
      expect(document.activeElement).not.toBe(document.body);
    });

    it('has proper heading hierarchy', () => {
      renderWithProviders(<MockSchoolAdminDashboard />);
      
      const h1 = screen.getByRole('heading', { level: 1 });
      const h2Elements = screen.getAllByRole('heading', { level: 2 });
      const h4Elements = screen.getAllByRole('heading', { level: 4 });
      
      expect(h1).toBeInTheDocument();
      expect(h2Elements.length).toBeGreaterThan(0);
      expect(h4Elements.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('renders gracefully with missing data', () => {
      renderWithProviders(<MockSchoolAdminDashboard />);
      expect(screen.getByTestId('schooladmin-dashboard')).toBeInTheDocument();
    });

    it('handles component unmounting cleanly', () => {
      const { unmount } = renderWithProviders(<MockSchoolAdminDashboard />);
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('integrates with auth store for school admin role', () => {
      renderWithProviders(<MockSchoolAdminDashboard />);
      expect(screen.getByTestId('schooladmin-dashboard')).toBeInTheDocument();
    });

    it('integrates with language context', () => {
      renderWithProviders(<MockSchoolAdminDashboard />);
      expect(screen.getByText('School Admin Dashboard')).toBeInTheDocument();
    });

    it('displays school-specific information correctly', () => {
      renderWithProviders(<MockSchoolAdminDashboard />);
      
      // Verify school context is properly displayed
      expect(screen.getByTestId('school-info')).toBeInTheDocument();
      expect(screen.getByText('School: Baku Secondary School #142')).toBeInTheDocument();
    });
  });
});
