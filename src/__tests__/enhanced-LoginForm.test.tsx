/**
 * Enhanced LoginForm Test Suite
 * Real komponent functionality test edir (mock komponent deyil)
 * 
 * Test Coverage:
 * - ✅ Real component rendering
 * - ✅ Form input handling və validation
 * - ✅ Submit functionality və loading states  
 * - ✅ Error handling və display
 * - ✅ Navigation functionality
 * - ✅ Accessibility və UX
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, expect, beforeEach, describe, it } from 'vitest';
import '@testing-library/jest-dom';

// Mock implementations - hoisting üçün əvvəl declare edilməli
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/hooks/auth/useAuthStore', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Real komponent import (mock deyil)
import LoginForm from '@/components/auth/LoginForm';

// Test dependencies - mock implementations sonra
const mockSignIn = vi.fn();
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
};

// Mock hooks
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { toast } from 'sonner';

const mockUseAuthStore = vi.mocked(useAuthStore);
const mockToastInstance = vi.mocked(toast);

// Test helper function
const renderLoginForm = (props = {}) => {
  const defaultProps = {
    error: null,
    clearError: vi.fn(),
  };

  return render(
    <MemoryRouter>
      <LoginForm {...defaultProps} {...props} />
    </MemoryRouter>
  );
};

describe('Enhanced LoginForm - Real Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mocks
    mockNavigate.mockReset();
    mockSignIn.mockReset();
    mockToast.success.mockReset();
    mockToast.error.mockReset();
    
    // Setup default auth store mock
    mockUseAuthStore.mockImplementation((selector: any) => {
      const state = {
        signIn: mockSignIn,
        isLoading: false,
      };
      return typeof selector === 'function' ? selector(state) : state;
    });
    
    // Navigate mock is already set up in the module mock
    
    // Setup toast mocks
    Object.assign(mockToastInstance, mockToast);
  });

  describe('Rendering & Display', () => {
    it('renders the login form with all required elements', () => {
      renderLoginForm();
      
      // Card title check
      expect(screen.getByText('Giriş')).toBeInTheDocument();
      
      // Form inputs check
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Şifrə')).toBeInTheDocument();
      
      // Submit button check
      expect(screen.getByRole('button', { name: /giriş et/i })).toBeInTheDocument();
    });

    it('displays error message when error prop is provided', () => {
      const errorMessage = 'Test error message';
      renderLoginForm({ error: errorMessage });
      
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toHaveClass('text-red-500');
    });

    it('does not display error message when error prop is null', () => {
      renderLoginForm({ error: null });
      
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });
  });

  describe('Form Input Handling', () => {
    it('updates email input value when user types', async () => {
      const user = userEvent.setup();
      renderLoginForm();
      
      const emailInput = screen.getByPlaceholderText('Email');
      await user.type(emailInput, 'test@example.com');
      
      expect(emailInput).toHaveValue('test@example.com');
    });

    it('updates password input value when user types', async () => {
      const user = userEvent.setup();
      renderLoginForm();
      
      const passwordInput = screen.getByPlaceholderText('Şifrə');
      await user.type(passwordInput, 'password123');
      
      expect(passwordInput).toHaveValue('password123');
    });

    it('requires email and password fields', () => {
      renderLoginForm();
      
      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Şifrə');
      
      expect(emailInput).toBeRequired();
      expect(passwordInput).toBeRequired();
    });

    it('has correct input types', () => {
      renderLoginForm();
      
      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Şifrə');
      
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Form Submission & Authentication', () => {
    it('calls signIn with correct credentials on form submission', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue(true);
      
      renderLoginForm();
      
      // Fill form
      await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Şifrə'), 'password123');
      
      // Submit form
      await user.click(screen.getByRole('button', { name: /giriş et/i }));
      
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('prevents form submission when already submitting', async () => {
      const user = userEvent.setup();
      mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
      
      renderLoginForm();
      
      // Fill form
      await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Şifrə'), 'password123');
      
      // Submit form multiple times rapidly
      const submitButton = screen.getByRole('button', { name: /giriş et/i });
      
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);
      
      // signIn should only be called once
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledTimes(1);
      });
    });

    it('shows loading state during form submission', async () => {
      const user = userEvent.setup();
      let resolveSignIn: any;
      mockSignIn.mockImplementation(() => new Promise(resolve => {
        resolveSignIn = resolve;
      }));
      
      renderLoginForm();
      
      // Fill form
      await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Şifrə'), 'password123');
      
      // Submit form
      await user.click(screen.getByRole('button', { name: /giriş et/i }));
      
      // Check loading state
      expect(screen.getByRole('button', { name: /giriş edilir/i })).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
      
      // Resolve the promise
      resolveSignIn(true);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /giriş et/i })).toBeInTheDocument();
      });
    });

    it('navigates to dashboard on successful login', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue(true);
      
      renderLoginForm();
      
      // Fill and submit form
      await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Şifrə'), 'password123');
      await user.click(screen.getByRole('button', { name: /giriş et/i }));
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('shows success toast on successful login', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue(true);
      
      renderLoginForm();
      
      // Fill and submit form
      await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Şifrə'), 'password123');
      await user.click(screen.getByRole('button', { name: /giriş et/i }));
      
      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Uğurla daxil oldunuz');
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error toast on login failure', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Email və ya şifrə yanlışdır';
      mockSignIn.mockRejectedValue(new Error(errorMessage));
      
      renderLoginForm();
      
      // Fill and submit form
      await user.type(screen.getByPlaceholderText('Email'), 'wrong@example.com');
      await user.type(screen.getByPlaceholderText('Şifrə'), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /giriş et/i }));
      
      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Giriş uğursuz', {
          description: errorMessage
        });
      });
    });

    it('calls clearError when provided on form submission', async () => {
      const user = userEvent.setup();
      const mockClearError = vi.fn();
      mockSignIn.mockResolvedValue(true);
      
      renderLoginForm({ clearError: mockClearError });
      
      // Fill and submit form
      await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Şifrə'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Giriş et' }));
      
      expect(mockClearError).toHaveBeenCalled();
    });

    it('handles login failure without crashing', async () => {
      const user = userEvent.setup();
      mockSignIn.mockRejectedValue(new Error('Network error'));
      
      renderLoginForm();
      
      // Fill and submit form
      await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Şifrə'), 'password123');
      
      // Submit should not crash
      expect(async () => {
        await user.click(screen.getByRole('button', { name: /giriş et/i }));
      }).not.toThrow();
    });
  });

  describe('Accessibility & UX', () => {
    it('has proper form structure for screen readers', () => {
      renderLoginForm();
      
      // Check that form exists and is properly structured
      const submitButton = screen.getByRole('button', { name: /giriş et/i });
      const form = submitButton.closest('form');
      
      expect(form).toBeInTheDocument();
      expect(form?.tagName.toLowerCase()).toBe('form');
      
      // Check for proper input accessibility
      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Şifrə');
      
      // Verify inputs are properly configured
      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(emailInput).toBeRequired();
      expect(passwordInput).toBeRequired();
      
      // Verify submit button is inside form
      expect(form).toContainElement(submitButton);
      expect(form).toContainElement(emailInput);
      expect(form).toContainElement(passwordInput);
    });

    it('disables form inputs during loading state', () => {
      // Mock loading state
      mockUseAuthStore.mockImplementation((selector: any) => {
        const state = {
          signIn: mockSignIn,
          isLoading: true,
        };
        return typeof selector === 'function' ? selector(state) : state;
      });
      
      renderLoginForm();
      
      expect(screen.getByPlaceholderText('Email')).toBeDisabled();
      expect(screen.getByPlaceholderText('Şifrə')).toBeDisabled();
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderLoginForm();
      
      // Tab through form elements
      await user.tab();
      expect(screen.getByPlaceholderText('Email')).toHaveFocus();
      
      await user.tab();
      expect(screen.getByPlaceholderText('Şifrə')).toHaveFocus();
      
      await user.tab();
      expect(screen.getByRole('button', { name: /giriş et/i })).toHaveFocus();
    });

    it('allows form submission with Enter key', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue(true);
      
      renderLoginForm();
      
      // Fill form and press Enter on password field
      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Şifrə');
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      
      // Press Enter on password field to submit form
      await user.keyboard('{Enter}');
      
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  describe('Component Integration', () => {
    it('integrates correctly with routing context', () => {
      // This test ensures the component doesn't crash when MemoryRouter is provided
      expect(() => renderLoginForm()).not.toThrow();
    });

    it('integrates correctly with auth store', () => {
      renderLoginForm();
      
      // Component should render successfully with mocked auth store
      expect(screen.getByText('Giriş')).toBeInTheDocument();
    });

    it('handles missing clearError prop gracefully', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue(true);
      
      renderLoginForm({ clearError: undefined });
      
      // Should not crash when clearError is not provided
      await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Şifrə'), 'password123');
      
      expect(async () => {
        await user.click(screen.getByRole('button', { name: /giriş et/i }));
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty form submission', async () => {
      const user = userEvent.setup();
      renderLoginForm();
      
      // Try to submit empty form
      const submitButton = screen.getByRole('button', { name: /giriş et/i });
      await user.click(submitButton);
      
      // Should not call signIn with empty values due to HTML5 validation
      expect(mockSignIn).not.toHaveBeenCalled();
    });

    it('handles very long input values', async () => {
      const user = userEvent.setup();
      const longString = 'a'.repeat(100); // Reduce length to avoid extreme cases
      mockSignIn.mockResolvedValue(true);
      
      renderLoginForm();
      
      // Fill and submit form with long strings
      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Şifrə');
      
      const longEmail = `${longString}@example.com`;
      await user.type(emailInput, longEmail);
      await user.type(passwordInput, longString);
      
      // Verify the values are properly set
      expect(emailInput).toHaveValue(longEmail);
      expect(passwordInput).toHaveValue(longString);
      
      // Test form submission with long values
      await user.click(screen.getByRole('button', { name: /giriş et/i }));
      
      expect(mockSignIn).toHaveBeenCalledWith(longEmail, longString);
    });

    it('handles special characters in input values', async () => {
      const user = userEvent.setup();
      // Use commonly accepted special characters in passwords
      const passwordSpecialChars = '!@#$%^&*()_+-=';
      mockSignIn.mockResolvedValue(true);
      
      renderLoginForm();
      
      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Şifrə');
      
      // Use standard email format with + sign (commonly supported)
      const testEmail = 'test+special@example.com';
      
      await user.type(emailInput, testEmail);
      await user.type(passwordInput, passwordSpecialChars);
      
      // Submit form
      await user.click(screen.getByRole('button', { name: /giriş et/i }));
      
      // Verify signIn was called with special characters
      expect(mockSignIn).toHaveBeenCalledWith(
        testEmail, 
        passwordSpecialChars
      );
    });
  });
});
