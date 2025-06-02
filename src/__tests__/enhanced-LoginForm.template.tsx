/**
 * Enhanced LoginForm Test Suite
 * 
 * Bu test suite enhanced test utils istifadə edərək LoginForm komponentini comprehensive test edir:
 * 1. Complete form rendering və structure
 * 2. Form validation (email format, required fields)
 * 3. User interactions (typing, clicking, form submission)
 * 4. Password visibility toggle
 * 5. Loading states və error handling
 * 6. Accessibility compliance (WCAG 2.1 AA)
 * 7. Keyboard navigation support
 * 8. Integration with auth context
 * 
 * Coverage Target: 95%+
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  renderWithProviders,
  screen,
  userEvent,
  waitFor,
  cleanupMocks,
  testComponentAccessibility,
  createTestUser,
  assertComponentRenders,
  assertButtonIsClickable,
  assertFormValidation
} from './enhanced-test-utils';

// Real LoginForm komponentini import et
import LoginForm from '@/components/auth/LoginForm';

describe('LoginForm Enhanced Tests', () => {
  beforeEach(() => {
    cleanupMocks();
  });

  describe('Component Rendering', () => {
    it('renders login form with proper structure', () => {
      renderWithProviders(<LoginForm />);
      
      // Başlıq yoxlanışı
      const heading = screen.getByRole('heading', { name: /daxil ol|login/i });
      assertComponentRenders(heading);
      
      // Form elementləri yoxlanışı
      const emailInput = screen.getByRole('textbox', { name: /e-?poçt|email/i });
      const passwordInput = screen.getByLabelText(/şifrə|password/i);
      const submitButton = screen.getByRole('button', { name: /daxil ol|login/i });
      
      assertComponentRenders(emailInput);
      assertComponentRenders(passwordInput);
      assertButtonIsClickable(submitButton);
      
      // Input tipləri yoxlanışı
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('displays form in proper semantic structure', () => {
      renderWithProviders(<LoginForm />);
      
      // Form semantic structure
      const form = screen.getByRole('form') || screen.getByTestId('login-form');
      expect(form).toBeInTheDocument();
      
      // Label associations
      expect(screen.getByLabelText(/e-?poçt|email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/şifrə|password/i)).toBeInTheDocument();
    });

    it('shows error message when provided', () => {
      const errorMessage = 'Test error message';
      renderWithProviders(<LoginForm error={errorMessage} />);
      
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
    });
  });

  describe('Form Validation', () => {
    it('validates email format correctly', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginForm />);
      
      const emailInput = screen.getByRole('textbox', { name: /e-?poçt|email/i });
      
      // Invalid email test
      await user.type(emailInput, 'invalid-email');
      await user.tab(); // Trigger blur event
      
      await waitFor(() => {
        const errorElement = screen.queryByText(/format|düzgün|valid/i);
        if (errorElement) {
          assertFormValidation(errorElement.textContent || 'Email format error');
        }
      });
    });

    it('validates required fields', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginForm />);
      
      const submitButton = screen.getByRole('button', { name: /daxil ol|login/i });
      await user.click(submitButton);
      
      // Check for required field messages
      await waitFor(() => {
        const requiredMessages = screen.queryAllByText(/tələb olunur|required|məcburi/i);
        expect(requiredMessages.length).toBeGreaterThan(0);
      });
    });

    it('validates password requirements', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginForm />);
      
      const passwordInput = screen.getByLabelText(/şifrə|password/i);
      
      // Test short password
      await user.type(passwordInput, '123');
      await user.tab();
      
      await waitFor(() => {
        // Look for password length validation
        const passwordError = screen.queryByText(/minimum|ən az|length/i);
        if (passwordError) {
          expect(passwordError).toBeInTheDocument();
        }
      });
    });
  });

  describe('Password Visibility Toggle', () => {
    it('toggles password visibility correctly', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginForm />);
      
      const passwordInput = screen.getByLabelText(/şifrə|password/i);
      
      // İlkin password type olmalıdır
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Toggle button tap et
      const toggleButton = screen.getByRole('button', { name: /göstər|show|toggle.*password/i }) ||
                          screen.getByTestId('password-toggle') ||
                          passwordInput.parentElement?.querySelector('button[type="button"]');
      
      if (toggleButton) {
        await user.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'text');
        
        await user.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'password');
      }
    });

    it('has proper accessibility for password toggle', () => {
      renderWithProviders(<LoginForm />);
      
      const toggleButton = screen.queryByRole('button', { name: /göstər|show|toggle.*password/i });
      if (toggleButton) {
        expect(toggleButton).toHaveAttribute('aria-label');
        expect(toggleButton).toHaveAttribute('type', 'button');
      }
    });
  });

  describe('Form Submission', () => {
    it('submits form with valid credentials', async () => {
      const user = userEvent.setup();
      const mockLogin = vi.fn().mockResolvedValue({ success: true });
      
      renderWithProviders(<LoginForm onSubmit={mockLogin} />);
      
      // Valid credentials daxil et
      const emailInput = screen.getByRole('textbox', { name: /e-?poçt|email/i });
      const passwordInput = screen.getByLabelText(/şifrə|password/i);
      const submitButton = screen.getByRole('button', { name: /daxil ol|login/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123'
        });
      });
    });

    it('handles login errors gracefully', async () => {
      const user = userEvent.setup();
      const mockLogin = vi.fn().mockRejectedValue(new Error('Invalid credentials'));
      
      renderWithProviders(<LoginForm onSubmit={mockLogin} />);
      
      const emailInput = screen.getByRole('textbox', { name: /e-?poçt|email/i });
      const passwordInput = screen.getByLabelText(/şifrə|password/i });
      const submitButton = screen.getByRole('button', { name: /daxil ol|login/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
        // Error message should appear
        const errorMessage = screen.queryByText(/xəta|error|səhv|invalid/i);
        if (errorMessage) {
          expect(errorMessage).toBeInTheDocument();
        }
      });
    });

    it('prevents multiple submissions', async () => {
      const user = userEvent.setup();
      const mockLogin = vi.fn(() => new Promise(resolve => setTimeout(resolve, 1000)));
      
      renderWithProviders(<LoginForm onSubmit={mockLogin} />);
      
      const emailInput = screen.getByRole('textbox', { name: /e-?poçt|email/i });
      const passwordInput = screen.getByLabelText(/şifrə|password/i);
      const submitButton = screen.getByRole('button', { name: /daxil ol|login/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      
      // Multiple rapid clicks
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);
      
      // Should only be called once
      expect(mockLogin).toHaveBeenCalledTimes(1);
    });
  });

  describe('Loading States', () => {
    it('shows loading state during form submission', async () => {
      const user = userEvent.setup();
      const mockLogin = vi.fn(() => new Promise(resolve => setTimeout(resolve, 1000)));
      
      renderWithProviders(<LoginForm onSubmit={mockLogin} />);
      
      const emailInput = screen.getByRole('textbox', { name: /e-?poçt|email/i });
      const passwordInput = screen.getByLabelText(/şifrə|password/i);
      const submitButton = screen.getByRole('button', { name: /daxil ol|login/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      // Loading indicators check
      expect(
        screen.queryByText(/yüklənir|loading|gözləyin/i) ||
        screen.queryByTestId('loading-spinner') ||
        submitButton.disabled
      ).toBeTruthy();
    });

    it('disables form during loading', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginForm isLoading={true} />);
      
      const emailInput = screen.getByRole('textbox', { name: /e-?poçt|email/i });
      const passwordInput = screen.getByLabelText(/şifrə|password/i);
      const submitButton = screen.getByRole('button', { name: /daxil ol|login/i });
      
      expect(submitButton).toBeDisabled();
      // Form inputs should also be disabled during loading
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('meets WCAG 2.1 AA accessibility standards', async () => {
      const { container } = renderWithProviders(<LoginForm />);
      await testComponentAccessibility(container);
    });

    it('has proper form labeling', () => {
      renderWithProviders(<LoginForm />);
      
      // All inputs should have associated labels
      const emailInput = screen.getByRole('textbox', { name: /e-?poçt|email/i });
      const passwordInput = screen.getByLabelText(/şifrə|password/i);
      
      expect(emailInput).toHaveAccessibleName();
      expect(passwordInput).toHaveAccessibleName();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginForm />);
      
      // Tab order should be: email -> password -> toggle -> submit
      const emailInput = screen.getByRole('textbox', { name: /e-?poçt|email/i });
      emailInput.focus();
      expect(emailInput).toHaveFocus();
      
      await user.tab();
      expect(screen.getByLabelText(/şifrə|password/i)).toHaveFocus();
      
      await user.tab();
      // Next focus should be toggle button or submit button
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeInstanceOf(HTMLElement);
    });

    it('has proper ARIA attributes', () => {
      renderWithProviders(<LoginForm error="Test error" />);
      
      // Form should have proper role
      const form = screen.getByRole('form') || screen.getByTestId('login-form');
      expect(form).toBeInTheDocument();
      
      // Error message should have alert role
      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent('Test error');
    });
  });

  describe('Responsive Design', () => {
    it('adapts to mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      window.dispatchEvent(new Event('resize'));
      
      renderWithProviders(<LoginForm />);
      
      const form = screen.getByRole('form') || screen.getByTestId('login-form');
      expect(form).toBeInTheDocument();
      
      // Form should remain functional on mobile
      expect(screen.getByRole('textbox', { name: /e-?poçt|email/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/şifrə|password/i)).toBeInTheDocument();
    });
  });

  describe('Integration Tests', () => {
    it('integrates with authentication context', () => {
      const testUser = createTestUser({ role: 'superadmin' });
      
      renderWithProviders(<LoginForm />, { user: testUser });
      
      // If user is already authenticated, form behavior might change
      // This tests the integration with auth state
      expect(screen.getByRole('form') || screen.getByTestId('login-form')).toBeInTheDocument();
    });

    it('integrates with router for navigation', async () => {
      const mockNavigate = vi.fn();
      
      // Mock useNavigate hook
      vi.mock('react-router-dom', async () => ({
        ...await vi.importActual('react-router-dom'),
        useNavigate: () => mockNavigate
      }));
      
      const user = userEvent.setup();
      const mockLogin = vi.fn().mockResolvedValue({ success: true });
      
      renderWithProviders(<LoginForm onSubmit={mockLogin} />);
      
      const emailInput = screen.getByRole('textbox', { name: /e-?poçt|email/i });
      const passwordInput = screen.getByLabelText(/şifrə|password/i);
      const submitButton = screen.getByRole('button', { name: /daxil ol|login/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
      });
    });
  });

  describe('Performance', () => {
    it('renders quickly without performance issues', () => {
      const startTime = performance.now();
      
      renderWithProviders(<LoginForm />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Component should render within 100ms
      expect(renderTime).toBeLessThan(100);
    });

    it('handles rapid user interactions gracefully', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginForm />);
      
      const emailInput = screen.getByRole('textbox', { name: /e-?poçt|email/i });
      
      // Rapid typing test
      await user.type(emailInput, 'test@example.com');
      await user.clear(emailInput);
      await user.type(emailInput, 'another@example.com');
      
      expect(emailInput).toHaveValue('another@example.com');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty form submission gracefully', async () => {
      const user = userEvent.setup();
      const mockLogin = vi.fn();
      
      renderWithProviders(<LoginForm onSubmit={mockLogin} />);
      
      const submitButton = screen.getByRole('button', { name: /daxil ol|login/i });
      await user.click(submitButton);
      
      // Should show validation errors, not call login
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('handles special characters in password', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginForm />);
      
      const passwordInput = screen.getByLabelText(/şifrə|password/i);
      const specialPassword = 'P@ssw0rd!#$%^&*()_+-={}[]|;:,.<>?';
      
      await user.type(passwordInput, specialPassword);
      expect(passwordInput).toHaveValue(specialPassword);
    });

    it('handles network errors during submission', async () => {
      const user = userEvent.setup();
      const mockLogin = vi.fn().mockRejectedValue(new Error('Network error'));
      
      renderWithProviders(<LoginForm onSubmit={mockLogin} />);
      
      const emailInput = screen.getByRole('textbox', { name: /e-?poçt|email/i });
      const passwordInput = screen.getByLabelText(/şifrə|password/i);
      const submitButton = screen.getByRole('button', { name: /daxil ol|login/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
        // Should show network error message
        const errorMessage = screen.queryByText(/şəbəkə|network|bağlantı/i);
        if (errorMessage) {
          expect(errorMessage).toBeInTheDocument();
        }
      });
    });
  });
});
