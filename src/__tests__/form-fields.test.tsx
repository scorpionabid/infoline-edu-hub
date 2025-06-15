
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FormField from '../components/dataEntry/fields/FormField';

const createMockColumn = (overrides = {}) => ({
  id: 'test-field',
  category_id: 'test-category',
  name: 'Test Field',
  type: 'text' as const,
  is_required: true,
  placeholder: 'Enter test value',
  help_text: '',
  description: '',
  order_index: 0,
  status: 'active',
  default_value: '',
  options: [],
  validation: {},
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  ...overrides
});

describe('FormField Component', () => {
  it('renders text input correctly', () => {
    const mockOnChange = vi.fn();
    const mockColumn = createMockColumn();
    
    render(
      <FormField
        column={mockColumn}
        value=""
        onChange={mockOnChange}
      />
    );

    expect(screen.getByLabelText(/Test Field/)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const mockOnChange = vi.fn();
    const mockColumn = createMockColumn();
    
    render(
      <FormField
        column={mockColumn}
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test value' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('test value');
  });

  it('shows required indicator', () => {
    const mockOnChange = vi.fn();
    const mockColumn = createMockColumn();
    
    render(
      <FormField
        column={mockColumn}
        value=""
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders select field correctly', () => {
    const selectColumn = createMockColumn({
      type: 'select',
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' }
      ]
    });

    const mockOnChange = vi.fn();
    
    render(
      <FormField
        column={selectColumn}
        value=""
        onChange={mockOnChange}
      />
    );

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
