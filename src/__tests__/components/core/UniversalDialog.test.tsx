
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import UniversalDialog from '@/components/core/UniversalDialog';
import { useTranslation } from '@/contexts/TranslationContext';

// Mock the translation context
vi.mock('@/contexts/TranslationContext', () => ({
  useTranslation: vi.fn(() => ({
    t: (key: string) => key,
    language: 'az',
    setLanguage: vi.fn(),
    changeLanguage: vi.fn(),
    isLoading: false,
    error: null,
    isReady: true
  }))
}));

describe('UniversalDialog Component', () => {
  it('should render the dialog when isOpen is true', () => {
    render(
      <UniversalDialog
        isOpen={true}
        title="Test Title"
        content="Test Content"
        confirmText="Confirm"
        cancelText="Cancel"
        onClose={() => {}}
        onConfirm={() => {}}
      />
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render confirm and cancel buttons', () => {
    render(
      <UniversalDialog
        isOpen={true}
        title="Test Title"
        content="Test Content"
        confirmText="Confirm"
        cancelText="Cancel"
        onClose={() => {}}
        onConfirm={() => {}}
      />
    );

    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('should not render the dialog when isOpen is false', () => {
    render(
      <UniversalDialog
        isOpen={false}
        title="Test Title"
        content="Test Content"
        confirmText="Confirm"
        cancelText="Cancel"
        onClose={() => {}}
        onConfirm={() => {}}
      />
    );

    expect(screen.queryByText('Test Title')).toBeNull();
    expect(screen.queryByText('Test Content')).toBeNull();
  });
});
