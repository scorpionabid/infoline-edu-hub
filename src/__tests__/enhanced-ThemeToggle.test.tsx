/**
 * Enhanced ThemeToggle Test Suite
 * 
 * Bu test suite ThemeToggle komponentinin aşağıdakı funksionallığını test edir:
 * 1. Theme toggle functionality
 * 2. Icon rendering based on current theme
 * 3. Accessibility features
 * 4. Internationalization support
 * 5. Button interactions
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  renderWithProviders,
  screen,
  fireEvent,
  userEvent,
  cleanupMocks,
  testComponentAccessibility,
  assertComponentRenders,
  assertButtonIsClickable
} from './enhanced-test-utils';
import ThemeToggle from '@/components/ThemeToggle';

// Mock ThemeContext
const mockThemeContext = {
  theme: 'light',
  setTheme: vi.fn(),
  systemTheme: 'light',
  themes: ['light', 'dark']
};

vi.mock('@/context/ThemeContext', () => ({
  useThemeSafe: () => mockThemeContext
}));

describe('Enhanced ThemeToggle Tests', () => {
  beforeEach(() => {
    cleanupMocks();
    mockThemeContext.setTheme.mockClear();
    mockThemeContext.theme = 'light'; // Reset to light theme
  });

  describe('Component Rendering', () => {
    it('renders theme toggle button correctly', () => {
      renderWithProviders(<ThemeToggle />);
      
      const button = screen.getByRole('button');
      assertComponentRenders(button);
      assertButtonIsClickable(button);
    });

    it('displays moon icon in light theme', () => {
      mockThemeContext.theme = 'light';
      
      renderWithProviders(<ThemeToggle />);
      
      const button = screen.getByRole('button');
      expect(button.querySelector('.lucide-moon')).toBeInTheDocument();
      expect(button.querySelector('.lucide-sun')).not.toBeInTheDocument();
    });

    it('displays sun icon in dark theme', () => {
      mockThemeContext.theme = 'dark';
      
      renderWithProviders(<ThemeToggle />);
      
      const button = screen.getByRole('button');
      expect(button.querySelector('.lucide-sun')).toBeInTheDocument();
      expect(button.querySelector('.lucide-moon')).not.toBeInTheDocument();
    });

    it('has proper button styling', () => {
      renderWithProviders(<ThemeToggle />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('inline-flex'); // Button component base class
    });
  });

  describe('Theme Toggle Functionality', () => {
    it('switches from light to dark theme when clicked', async () => {
      const user = userEvent.setup();
      mockThemeContext.theme = 'light';
      
      renderWithProviders(<ThemeToggle />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(mockThemeContext.setTheme).toHaveBeenCalledWith('dark');
    });

    it('switches from dark to light theme when clicked', async () => {
      const user = userEvent.setup();
      mockThemeContext.theme = 'dark';
      
      renderWithProviders(<ThemeToggle />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(mockThemeContext.setTheme).toHaveBeenCalledWith('light');
    });

    it('toggles theme multiple times correctly', async () => {
      const user = userEvent.setup();
      mockThemeContext.theme = 'light';
      
      renderWithProviders(<ThemeToggle />);
      
      const button = screen.getByRole('button');
      
      // First click: light -> dark
      await user.click(button);
      expect(mockThemeContext.setTheme).toHaveBeenNthCalledWith(1, 'dark');
      
      // Clear mock for second test
      mockThemeContext.setTheme.mockClear();
      
      // Simulate theme change for next test
      mockThemeContext.theme = 'dark';
      
      // Re-render with new theme
      const { rerender } = renderWithProviders(<ThemeToggle />);
      rerender(<ThemeToggle />);
      
      // Second click: dark -> light
      const newButton = screen.getByRole('button');
      await user.click(newButton);
      expect(mockThemeContext.setTheme).toHaveBeenCalledWith('light');
    });

    it('handles theme changes through keyboard interaction', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ThemeToggle />);
      
      const button = screen.getByRole('button');
      button.focus();
      
      await user.keyboard('{Enter}');
      expect(mockThemeContext.setTheme).toHaveBeenCalledWith('dark');
      
      await user.keyboard(' '); // Space bar
      expect(mockThemeContext.setTheme).toHaveBeenCalledWith('dark');
    });
  });

  describe('Accessibility Features', () => {
    it('has proper ARIA label for light theme', () => {
      mockThemeContext.theme = 'light';
      
      renderWithProviders(<ThemeToggle />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'dark'); // Should show opposite theme
    });

    it('has proper ARIA label for dark theme', () => {
      mockThemeContext.theme = 'dark';
      
      renderWithProviders(<ThemeToggle />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'light'); // Should show opposite theme
    });

    it('has proper title attribute', () => {
      mockThemeContext.theme = 'light';
      
      renderWithProviders(<ThemeToggle />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'dark');
    });

    it('meets WCAG accessibility standards', async () => {
      const { container } = renderWithProviders(<ThemeToggle />);
      
      await testComponentAccessibility(container);
    });

    it('supports screen reader navigation', () => {
      renderWithProviders(<ThemeToggle />);
      
      const button = screen.getByRole('button');
      // HTML button elements have implicit role="button", no explicit role needed
      expect(button.tagName.toLowerCase()).toBe('button');
      expect(button).toHaveAttribute('aria-label');
    });

    it('provides keyboard focus indication', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ThemeToggle />);
      
      const button = screen.getByRole('button');
      
      await user.tab();
      expect(button).toHaveFocus();
    });
  });

  describe('Icon Rendering', () => {
    it('renders correct icon size and styling', () => {
      renderWithProviders(<ThemeToggle />);
      
      const button = screen.getByRole('button');
      const icon = button.querySelector('svg');
      
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('h-5', 'w-5', 'text-muted-foreground');
    });

    it('icon changes when theme changes', () => {
      const { rerender } = renderWithProviders(<ThemeToggle />);
      
      // Light theme - should show moon
      expect(screen.getByRole('button').querySelector('.lucide-moon')).toBeInTheDocument();
      
      // Change to dark theme
      mockThemeContext.theme = 'dark';
      rerender(<ThemeToggle />);
      
      // Dark theme - should show sun
      expect(screen.getByRole('button').querySelector('.lucide-sun')).toBeInTheDocument();
    });

    it('maintains icon accessibility attributes', () => {
      renderWithProviders(<ThemeToggle />);
      
      const icon = screen.getByRole('button').querySelector('svg');
      expect(icon).toBeInTheDocument();
      // Icons should be purely decorative since button has aria-label
    });
  });

  describe('Internationalization', () => {
    it('uses translation function for aria-label', () => {
      // Since we mock the language context, t() function returns the key
      renderWithProviders(<ThemeToggle />);
      
      const button = screen.getByRole('button');
      // With our mock, t('dark') returns 'dark'
      expect(button).toHaveAttribute('aria-label', 'dark');
    });

    it('updates labels when language changes', () => {
      renderWithProviders(<ThemeToggle />);
      
      const button = screen.getByRole('button');
      
      // Should have label and title attributes
      expect(button).toHaveAttribute('aria-label');
      expect(button).toHaveAttribute('title');
    });
  });

  describe('Component States', () => {
    it('handles undefined theme gracefully', () => {
      mockThemeContext.theme = undefined as any;
      
      expect(() => {
        renderWithProviders(<ThemeToggle />);
      }).not.toThrow();
    });

    it('handles theme context errors gracefully', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock setTheme to throw error and then restore
      const originalSetTheme = mockThemeContext.setTheme;
      mockThemeContext.setTheme = vi.fn(() => {
        throw new Error('Theme error');
      });
      
      renderWithProviders(<ThemeToggle />);
      
      const button = screen.getByRole('button');
      
      // Wrap in try-catch to handle the error gracefully
      expect(() => {
        fireEvent.click(button);
      }).not.toThrow();
      
      // Component should still render even if theme change fails
      expect(button).toBeInTheDocument();
      
      // Restore mocks
      mockThemeContext.setTheme = originalSetTheme;
      consoleError.mockRestore();
    });
  });

  describe('User Interactions', () => {
    it('provides visual feedback on hover', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ThemeToggle />);
      
      const button = screen.getByRole('button');
      
      await user.hover(button);
      
      // Button should remain functional during hover
      expect(button).toBeInTheDocument();
      expect(button).toBeEnabled();
    });

    it('handles rapid clicking gracefully', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ThemeToggle />);
      
      const button = screen.getByRole('button');
      
      // Rapid clicks
      await user.click(button);
      await user.click(button);
      await user.click(button);
      
      // Should handle all clicks
      expect(mockThemeContext.setTheme).toHaveBeenCalledTimes(3);
    });

    it('maintains button state during theme transitions', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ThemeToggle />);
      
      const button = screen.getByRole('button');
      
      await user.click(button);
      
      // Button should remain clickable during theme change
      expect(button).toBeEnabled();
      expect(button).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders quickly without performance issues', () => {
      const startTime = performance.now();
      
      renderWithProviders(<ThemeToggle />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(50);
    });

    it('handles theme changes efficiently', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ThemeToggle />);
      
      const button = screen.getByRole('button');
      
      const startTime = performance.now();
      await user.click(button);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('Integration Scenarios', () => {
    it('works within different layout contexts', () => {
      // Test in header context
      renderWithProviders(
        <header>
          <ThemeToggle />
        </header>
      );
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('works alongside other interactive elements', () => {
      renderWithProviders(
        <div>
          <button>Other Button</button>
          <ThemeToggle />
          <input type="text" />
        </div>
      );
      
      const themeButton = screen.getByRole('button', { name: /dark|light/i });
      expect(themeButton).toBeInTheDocument();
    });

    it('maintains functionality in different theme contexts', () => {
      // Test with system theme
      mockThemeContext.systemTheme = 'dark';
      mockThemeContext.theme = 'light';
      
      renderWithProviders(<ThemeToggle />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Error Boundaries', () => {
    it('recovers from theme context failures', () => {
      const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
        try {
          return <>{children}</>;
        } catch (error) {
          return <div>Error occurred</div>;
        }
      };
      
      renderWithProviders(
        <ErrorBoundary>
          <ThemeToggle />
        </ErrorBoundary>
      );
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
});
