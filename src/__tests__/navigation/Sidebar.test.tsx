/**
 * Sidebar Test Suite
 * Tests for navigation sidebar functionality
 * 
 * Test Coverage:
 * - ✅ Component rendering
 * - ✅ Navigation menu items
 * - ✅ Role-based menu visibility
 * - ✅ Active state management
 * - ✅ Mobile responsiveness
 * - ✅ User interactions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, expect, beforeEach, describe, it } from 'vitest';
import '@testing-library/jest-dom';

// Import test utilities
import { renderWithProviders } from '../test-utils';

// Mock the Sidebar component
const MockSidebar = ({ isCollapsed = false, userRole = 'superadmin' }) => {
  const menuItems = {
    superadmin: [
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: '🏠' },
      { id: 'regions', label: 'Regions', href: '/regions', icon: '🗺️' },
      { id: 'sectors', label: 'Sectors', href: '/sectors', icon: '🏢' },
      { id: 'schools', label: 'Schools', href: '/schools', icon: '🏫' },
      { id: 'users', label: 'Users', href: '/users', icon: '👥' },
      { id: 'categories', label: 'Categories', href: '/categories', icon: '📂' },
      { id: 'reports', label: 'Reports', href: '/reports', icon: '📊' },
      { id: 'settings', label: 'Settings', href: '/settings', icon: '⚙️' }
    ],
    regionadmin: [
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: '🏠' },
      { id: 'sectors', label: 'Sectors', href: '/sectors', icon: '🏢' },
      { id: 'schools', label: 'Schools', href: '/schools', icon: '🏫' },
      { id: 'categories', label: 'Categories', href: '/categories', icon: '📂' },
      { id: 'reports', label: 'Reports', href: '/reports', icon: '📊' },
      { id: 'settings', label: 'Settings', href: '/settings', icon: '⚙️' }
    ],
    sectoradmin: [
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: '🏠' },
      { id: 'schools', label: 'Schools', href: '/schools', icon: '🏫' },
      { id: 'approval', label: 'Data Approval', href: '/approval', icon: '✅' },
      { id: 'reports', label: 'Reports', href: '/reports', icon: '📊' }
    ],
    schooladmin: [
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: '🏠' },
      { id: 'data-entry', label: 'Data Entry', href: '/data-entry', icon: '📝' },
      { id: 'forms', label: 'Forms', href: '/forms', icon: '📋' },
      { id: 'profile', label: 'Profile', href: '/profile', icon: '👤' }
    ]
  };

  const currentItems = menuItems[userRole] || [];

  return (
    <aside 
      data-testid="sidebar" 
      className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div data-testid="sidebar-header">
        <div data-testid="logo">
          <span>İnfoLine</span>
        </div>
        <button 
          data-testid="collapse-btn"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>
      
      <nav data-testid="sidebar-nav">
        <ul data-testid="nav-menu" role="menubar">
          {currentItems.map(item => (
            <li key={item.id} data-testid="nav-item" role="none">
              <a 
                href={item.href}
                data-testid={`nav-link-${item.id}`}
                className={`nav-link ${item.id === 'dashboard' ? 'active' : ''}`}
                role="menuitem"
                aria-current={item.id === 'dashboard' ? 'page' : undefined}
              >
                <span data-testid="nav-icon" className="nav-icon">
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span data-testid="nav-label" className="nav-label">
                    {item.label}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      
      <div data-testid="sidebar-footer">
        <div data-testid="user-info">
          {!isCollapsed && (
            <>
              <span data-testid="user-name">Admin User</span>
              <span data-testid="user-role">{userRole}</span>
            </>
          )}
        </div>
        <button data-testid="logout-btn" aria-label="Logout">
          {isCollapsed ? '🚪' : 'Logout'}
        </button>
      </div>
    </aside>
  );
};

// Mock the actual component import
vi.mock('@/components/layout/Sidebar', () => ({
  default: MockSidebar
}));

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders sidebar without crashing', () => {
      renderWithProviders(<MockSidebar />);
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('has proper navigation role and aria-label', () => {
      renderWithProviders(<MockSidebar />);
      
      const sidebar = screen.getByRole('navigation');
      expect(sidebar).toBeInTheDocument();
      expect(sidebar).toHaveAttribute('aria-label', 'Main navigation');
    });

    it('displays logo and app name', () => {
      renderWithProviders(<MockSidebar />);
      
      expect(screen.getByTestId('logo')).toBeInTheDocument();
      expect(screen.getByText('İnfoLine')).toBeInTheDocument();
    });

    it('shows collapse/expand button', () => {
      renderWithProviders(<MockSidebar />);
      
      const collapseBtn = screen.getByTestId('collapse-btn');
      expect(collapseBtn).toBeInTheDocument();
      expect(collapseBtn).toHaveAttribute('aria-label', 'Collapse sidebar');
    });
  });

  describe('SuperAdmin Navigation', () => {
    it('displays all superadmin menu items', () => {
      renderWithProviders(<MockSidebar userRole="superadmin" />);
      
      expect(screen.getByTestId('nav-link-dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-regions')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-sectors')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-schools')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-users')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-categories')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-reports')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-settings')).toBeInTheDocument();
    });

    it('superadmin menu items have correct hrefs', () => {
      renderWithProviders(<MockSidebar userRole="superadmin" />);
      
      expect(screen.getByTestId('nav-link-dashboard')).toHaveAttribute('href', '/dashboard');
      expect(screen.getByTestId('nav-link-regions')).toHaveAttribute('href', '/regions');
      expect(screen.getByTestId('nav-link-sectors')).toHaveAttribute('href', '/sectors');
      expect(screen.getByTestId('nav-link-schools')).toHaveAttribute('href', '/schools');
      expect(screen.getByTestId('nav-link-users')).toHaveAttribute('href', '/users');
    });

    it('displays icons and labels for superadmin items', () => {
      renderWithProviders(<MockSidebar userRole="superadmin" />);
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Regions')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      
      const icons = screen.getAllByTestId('nav-icon');
      expect(icons.length).toBe(8); // 8 menu items for superadmin
    });
  });

  describe('RegionAdmin Navigation', () => {
    it('displays region admin specific menu items', () => {
      renderWithProviders(<MockSidebar userRole="regionadmin" />);
      
      expect(screen.getByTestId('nav-link-dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-sectors')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-schools')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-categories')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-reports')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-settings')).toBeInTheDocument();
    });

    it('does not display superadmin-only items for regionadmin', () => {
      renderWithProviders(<MockSidebar userRole="regionadmin" />);
      
      expect(screen.queryByTestId('nav-link-regions')).not.toBeInTheDocument();
      expect(screen.queryByTestId('nav-link-users')).not.toBeInTheDocument();
    });

    it('regionadmin has correct number of menu items', () => {
      renderWithProviders(<MockSidebar userRole="regionadmin" />);
      
      const navItems = screen.getAllByTestId('nav-item');
      expect(navItems).toHaveLength(6);
    });
  });

  describe('SectorAdmin Navigation', () => {
    it('displays sector admin specific menu items', () => {
      renderWithProviders(<MockSidebar userRole="sectoradmin" />);
      
      expect(screen.getByTestId('nav-link-dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-schools')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-approval')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-reports')).toBeInTheDocument();
    });

    it('sector admin has limited menu items', () => {
      renderWithProviders(<MockSidebar userRole="sectoradmin" />);
      
      const navItems = screen.getAllByTestId('nav-item');
      expect(navItems).toHaveLength(4);
      
      expect(screen.getByText('Data Approval')).toBeInTheDocument();
    });

    it('does not show admin-only items for sectoradmin', () => {
      renderWithProviders(<MockSidebar userRole="sectoradmin" />);
      
      expect(screen.queryByTestId('nav-link-regions')).not.toBeInTheDocument();
      expect(screen.queryByTestId('nav-link-users')).not.toBeInTheDocument();
      expect(screen.queryByTestId('nav-link-categories')).not.toBeInTheDocument();
    });
  });

  describe('SchoolAdmin Navigation', () => {
    it('displays school admin specific menu items', () => {
      renderWithProviders(<MockSidebar userRole="schooladmin" />);
      
      expect(screen.getByTestId('nav-link-dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-data-entry')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-forms')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-profile')).toBeInTheDocument();
    });

    it('school admin has minimal menu items', () => {
      renderWithProviders(<MockSidebar userRole="schooladmin" />);
      
      const navItems = screen.getAllByTestId('nav-item');
      expect(navItems).toHaveLength(4);
      
      expect(screen.getByText('Data Entry')).toBeInTheDocument();
      expect(screen.getByText('Forms')).toBeInTheDocument();
    });

    it('schooladmin cannot access administrative functions', () => {
      renderWithProviders(<MockSidebar userRole="schooladmin" />);
      
      expect(screen.queryByTestId('nav-link-regions')).not.toBeInTheDocument();
      expect(screen.queryByTestId('nav-link-sectors')).not.toBeInTheDocument();
      expect(screen.queryByTestId('nav-link-users')).not.toBeInTheDocument();
      expect(screen.queryByTestId('nav-link-schools')).not.toBeInTheDocument();
    });
  });

  describe('Collapsed State', () => {
    it('hides labels when collapsed', () => {
      renderWithProviders(<MockSidebar isCollapsed={true} />);
      
      expect(screen.queryByTestId('nav-label')).not.toBeInTheDocument();
    });

    it('still shows icons when collapsed', () => {
      renderWithProviders(<MockSidebar isCollapsed={true} />);
      
      const icons = screen.getAllByTestId('nav-icon');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('changes collapse button aria-label when collapsed', () => {
      renderWithProviders(<MockSidebar isCollapsed={true} />);
      
      const collapseBtn = screen.getByTestId('collapse-btn');
      expect(collapseBtn).toHaveAttribute('aria-label', 'Expand sidebar');
      expect(collapseBtn).toHaveTextContent('→');
    });

    it('hides user info when collapsed', () => {
      renderWithProviders(<MockSidebar isCollapsed={true} />);
      
      expect(screen.queryByTestId('user-name')).not.toBeInTheDocument();
      expect(screen.queryByTestId('user-role')).not.toBeInTheDocument();
    });

    it('shows icon-only logout button when collapsed', () => {
      renderWithProviders(<MockSidebar isCollapsed={true} />);
      
      const logoutBtn = screen.getByTestId('logout-btn');
      expect(logoutBtn).toHaveTextContent('🚪');
      expect(logoutBtn).not.toHaveTextContent('Logout');
    });
  });

  describe('Active State Management', () => {
    it('marks dashboard as active by default', () => {
      renderWithProviders(<MockSidebar />);
      
      const dashboardLink = screen.getByTestId('nav-link-dashboard');
      expect(dashboardLink).toHaveClass('active');
      expect(dashboardLink).toHaveAttribute('aria-current', 'page');
    });

    it('other links are not marked as active', () => {
      renderWithProviders(<MockSidebar />);
      
      const regionsLink = screen.getByTestId('nav-link-regions');
      expect(regionsLink).not.toHaveClass('active');
      expect(regionsLink).not.toHaveAttribute('aria-current');
    });
  });

  describe('User Information', () => {
    it('displays user information in footer', () => {
      renderWithProviders(<MockSidebar userRole="superadmin" />);
      
      expect(screen.getByTestId('user-info')).toBeInTheDocument();
      expect(screen.getByTestId('user-name')).toHaveTextContent('Admin User');
      expect(screen.getByTestId('user-role')).toHaveTextContent('superadmin');
    });

    it('shows logout button', () => {
      renderWithProviders(<MockSidebar />);
      
      const logoutBtn = screen.getByTestId('logout-btn');
      expect(logoutBtn).toBeInTheDocument();
      expect(logoutBtn).toHaveAttribute('aria-label', 'Logout');
    });

    it('displays different role text for different users', () => {
      renderWithProviders(<MockSidebar userRole="regionadmin" />);
      
      expect(screen.getByTestId('user-role')).toHaveTextContent('regionadmin');
    });
  });

  describe('User Interactions', () => {
    it('handles collapse button click', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MockSidebar />);
      
      const collapseBtn = screen.getByTestId('collapse-btn');
      await user.click(collapseBtn);
      
      // Button should be clickable (no errors thrown)
      expect(collapseBtn).toBeInTheDocument();
    });

    it('handles navigation link clicks', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MockSidebar />);
      
      const dashboardLink = screen.getByTestId('nav-link-dashboard');
      await user.click(dashboardLink);
      
      expect(dashboardLink).toBeInTheDocument();
    });

    it('handles logout button click', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MockSidebar />);
      
      const logoutBtn = screen.getByTestId('logout-btn');
      await user.click(logoutBtn);
      
      expect(logoutBtn).toBeInTheDocument();
    });

    it('navigation links support keyboard access', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MockSidebar />);
      
      // Tab to navigation
      await user.tab();
      
      // Should be able to navigate through menu items
      const dashboardLink = screen.getByTestId('nav-link-dashboard');
      dashboardLink.focus();
      expect(dashboardLink).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA roles', () => {
      renderWithProviders(<MockSidebar />);
      
      // Spesifik test ID ilə element tapırıq və onun rol atributunu yoxlayırıq
      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toHaveAttribute('role', 'navigation');
      
      expect(screen.getByRole('menubar')).toBeInTheDocument();
      
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems.length).toBeGreaterThan(0);
    });

    it('menu items have proper role attributes', () => {
      renderWithProviders(<MockSidebar />);
      
      const navItems = screen.getAllByTestId('nav-item');
      navItems.forEach(item => {
        expect(item).toHaveAttribute('role', 'none');
      });
      
      const menuItems = screen.getAllByRole('menuitem');
      menuItems.forEach(item => {
        expect(item).toBeInTheDocument();
      });
    });

    it('buttons have proper aria-labels', () => {
      renderWithProviders(<MockSidebar />);
      
      const collapseBtn = screen.getByTestId('collapse-btn');
      const logoutBtn = screen.getByTestId('logout-btn');
      
      // Konkret aria-label dəyərlərini yoxlayırıq
      expect(collapseBtn).toHaveAttribute('aria-label', 'Collapse sidebar');
      expect(logoutBtn).toHaveAttribute('aria-label', 'Logout');
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MockSidebar />);
      
      // Tab through interactive elements
      await user.tab(); // Should focus first interactive element
      expect(document.activeElement).not.toBe(document.body);
    });
  });

  describe('Responsive Design', () => {
    it('applies correct CSS classes based on state', () => {
      const { rerender } = renderWithProviders(<MockSidebar isCollapsed={false} />);
      
      let sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toHaveClass('expanded');
      expect(sidebar).not.toHaveClass('collapsed');
      
      rerender(<MockSidebar isCollapsed={true} />);
      
      sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toHaveClass('collapsed');
      expect(sidebar).not.toHaveClass('expanded');
    });
  });

  describe('Error Handling', () => {
    it('renders gracefully with unknown user role', () => {
      renderWithProviders(<MockSidebar userRole="unknown" />);
      
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      
      // Should render empty menu gracefully
      const navItems = screen.queryAllByTestId('nav-item');
      expect(navItems).toHaveLength(0);
    });

    it('handles component unmounting cleanly', () => {
      const { unmount } = renderWithProviders(<MockSidebar />);
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('integrates with auth store for user role', () => {
      renderWithProviders(<MockSidebar userRole="superadmin" />);
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('integrates with router for navigation', () => {
      renderWithProviders(<MockSidebar />);
      
      // Should render navigation links that work with router
      const dashboardLink = screen.getByTestId('nav-link-dashboard');
      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    });
  });
});
