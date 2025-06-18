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
    isLoading: false,
    error: null,
    isReady: true
  }))
}));

describe('UniversalDialog Component', () => {
  it('should render the dialog with title and content', () => {
    render(
      <UniversalDialog
        open={true}
        title="Test Title"
        content="Test Content"
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
        open={true}
        title="Test Title"
        content="Test Content"
        onClose={() => {}}
        onConfirm={() => {}}
      />
    );

    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('should not render the dialog when open is false', () => {
    render(
      <UniversalDialog
        open={false}
        title="Test Title"
        content="Test Content"
        onClose={() => {}}
        onConfirm={() => {}}
      />
    );

    expect(screen.queryByText('Test Title')).toBeNull();
    expect(screen.queryByText('Test Content')).toBeNull();
  });
});
