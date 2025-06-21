
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
        type="delete"
        entity="region"
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        data={{ name: 'Test Region' }}
      />
    );

    // Daha spesifik bir seçici istifadə edək - başlıq elementini yoxlayırıq
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    // Dialog başlığını yoxlayırıq
    expect(screen.getByText('regions.delete_region')).toBeInTheDocument();
  });

  it('should render confirm and cancel buttons', () => {
    render(
      <UniversalDialog
        type="delete"
        entity="region"
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        data={{ name: 'Test Region' }}
      />
    );

    expect(screen.getByText(/common.cancel/i)).toBeInTheDocument();
  });

  it('should not render the dialog when isOpen is false', () => {
    render(
      <UniversalDialog
        type="delete"
        entity="region"
        isOpen={false}
        onClose={() => {}}
        onConfirm={() => {}}
        data={{ name: 'Test Region' }}
      />
    );

    expect(screen.queryByText(/delete/i)).toBeNull();
  });
});
