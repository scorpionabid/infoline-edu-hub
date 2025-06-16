import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UniversalDialog } from '../../../components/core/UniversalDialog';
import { useLanguage } from '@/context/LanguageContext';

// Mock dependencies
vi.mock('@/context/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

const mockUseLanguage = vi.mocked(useLanguage);

describe('UniversalDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLanguage.mockReturnValue({
      t: (key: string) => key,
      language: 'az',
      setLanguage: vi.fn()
    } as any);
  });

  describe('Delete Dialog', () => {
    it('renders delete school dialog correctly', () => {
      const school = { id: '1', name: 'Test Məktəbi' };
      
      render(
        <UniversalDialog
          type="delete"
          entity="school"
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          data={school}
          isSubmitting={false}
        />
      );

      // The actual text is now using translation keys
      expect(screen.getByText('deleteSchool')).toBeInTheDocument();
      
      // For text that might be wrapped in quotes or have whitespace
      const schoolNameElement = screen.getByText((content, node) => {
        const hasText = (node: ChildNode | null) => node?.textContent?.includes('Test Məktəbi');
        const nodeHasText = hasText(node);
        const childrenDontHaveText = Array.from(node?.children || []).every(
          child => !hasText(child as ChildNode)
        );
        return nodeHasText && childrenDontHaveText;
      });
      expect(schoolNameElement).toBeInTheDocument();
      
      // Check for warning and consequences text
      expect(screen.getByText('deleteSchoolWarning')).toBeInTheDocument();
      expect(screen.getByText('deleteSchoolConsequences')).toBeInTheDocument();
    });

    it('shows loading state correctly', () => {
      const school = { id: '1', name: 'Test Məktəbi' };
      
      render(
        <UniversalDialog
          type="delete"
          entity="school"
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          data={school}
          isSubmitting={true}
        />
      );

      expect(screen.getByText('Silinir...')).toBeInTheDocument();
    });

    it('handles confirm click', async () => {
      const school = { id: '1', name: 'Test Məktəbi' };
      
      render(
        <UniversalDialog
          type="delete"
          entity="school"
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          data={school}
          isSubmitting={false}
        />
      );

      const confirmButton = screen.getByRole('button', { name: /sil/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      });
    });
  });
});