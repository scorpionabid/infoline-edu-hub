
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FormField from '../components/dataEntry/fields/FormField';

const mockColumn = {
  id: 'test-field',
  name: 'Test Field',
  type: 'text',
  is_required: true,
  placeholder: 'Enter test value'
};

describe('FormField Component', () => {
  it('renders text input correctly', () => {
    const mockOnChange = vi.fn();
    
    render(
      <FormField
        id="test"
        name="Test Field"
        value=""
        onChange={mockOnChange}
        column={mockColumn}
      />
    );

    expect(screen.getByLabelText(/Test Field/)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const mockOnChange = vi.fn();
    
    render(
      <FormField
        id="test"
        name="Test Field"
        value=""
        onChange={mockOnChange}
        column={mockColumn}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test value' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('test value');
  });

  it('shows required indicator', () => {
    const mockOnChange = vi.fn();
    
    render(
      <FormField
        id="test"
        name="Test Field"
        value=""
        onChange={mockOnChange}
        column={mockColumn}
      />
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders select field correctly', () => {
    const selectColumn = {
      ...mockColumn,
      type: 'select',
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' }
      ]
    };

    const mockOnChange = vi.fn();
    
    render(
      <FormField
        id="test"
        name="Test Field"
        value=""
        onChange={mockOnChange}
        column={selectColumn}
      />
    );

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
