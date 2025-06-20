import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { DataEntryForm } from '@/components/dataEntry/DataEntryForm';

const mockOnFormDataChange = vi.fn();
const mockOnFieldChange = vi.fn();

const mockCategory = {
  id: 'test-category',
  name: 'Test Category',
  description: 'Test description',
  assignment: 'all' as const,
  columns: [
    {
      id: 'text-field',
      name: 'Text Field',
      type: 'text' as const,
      is_required: true,
      placeholder: 'Enter text',
      help_text: 'This is a text field'
    },
    {
      id: 'number-field',
      name: 'Number Field',
      type: 'number' as const,
      is_required: false,
      placeholder: 'Enter number',
      validation: {
        min: 0,
        max: 100
      }
    },
    {
      id: 'select-field',
      name: 'Select Field',
      type: 'select' as const,
      is_required: true,
      placeholder: 'Choose option',
      options: [
        { label: 'Option 1', value: 'opt1' },
        { label: 'Option 2', value: 'opt2' }
      ]
    }
  ]
};

describe('DataEntryForm', () => {
  const defaultProps = {
    category: mockCategory,
    schoolId: 'test-school',
    formData: {},
    onFormDataChange: mockOnFormDataChange,
    onFieldChange: mockOnFieldChange,
    readOnly: false,
    isLoading: false,
    showValidation: true,
    compactMode: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<DataEntryForm {...defaultProps} />);
    
    expect(screen.getByLabelText(/Text Field/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Number Field/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Select Field/)).toBeInTheDocument();
  });

  it('shows required field indicators', () => {
    render(<DataEntryForm {...defaultProps} />);
    
    // Required fields should have asterisk
    expect(screen.getByText('*')).toBeInTheDocument();
    
    // Required badges should be present
    expect(screen.getAllByText('Məcburi')).toHaveLength(2); // text and select fields
  });

  it('displays help text', () => {
    render(<DataEntryForm {...defaultProps} />);
    
    expect(screen.getByText('This is a text field')).toBeInTheDocument();
  });

  it('handles text input changes', () => {
    render(<DataEntryForm {...defaultProps} />);
    
    const textInput = screen.getByLabelText(/Text Field/);
    fireEvent.change(textInput, { target: { value: 'test value' } });
    
    expect(mockOnFieldChange).toHaveBeenCalledWith('text-field', 'test value');
  });

  it('handles number input changes', () => {
    render(<DataEntryForm {...defaultProps} />);
    
    const numberInput = screen.getByLabelText(/Number Field/);
    fireEvent.change(numberInput, { target: { value: '42' } });
    
    expect(mockOnFieldChange).toHaveBeenCalledWith('number-field', '42');
  });

  it('validates required fields', () => {
    render(<DataEntryForm {...defaultProps} showValidation={true} />);
    
    // Required field without value should show error
    expect(screen.getByText('Bu sahə məcburidir')).toBeInTheDocument();
  });

  it('validates number field constraints', () => {
    const formDataWithInvalidNumber = {
      'number-field': '150' // exceeds max of 100
    };
    
    render(
      <DataEntryForm 
        {...defaultProps} 
        formData={formDataWithInvalidNumber}
        showValidation={true} 
      />
    );
    
    expect(screen.getByText('Maksimum dəyər: 100')).toBeInTheDocument();
  });

  it('shows success indicator for valid required fields', () => {
    const formDataWithValidData = {
      'text-field': 'valid text',
      'select-field': 'opt1'
    };
    
    render(
      <DataEntryForm 
        {...defaultProps} 
        formData={formDataWithValidData}
        showValidation={true} 
      />
    );
    
    expect(screen.getAllByText('Düzgün')).toHaveLength(2);
  });

  it('handles readonly mode', () => {
    render(<DataEntryForm {...defaultProps} readOnly={true} />);
    
    const textInput = screen.getByLabelText(/Text Field/);
    expect(textInput).toBeDisabled();
  });

  it('handles loading state', () => {
    render(<DataEntryForm {...defaultProps} isLoading={true} />);
    
    const textInput = screen.getByLabelText(/Text Field/);
    expect(textInput).toBeDisabled();
  });

  it('renders in compact mode', () => {
    render(<DataEntryForm {...defaultProps} compactMode={true} />);
    
    // Should show form summary in compact mode
    expect(screen.getByText(/Doldurulmuş:/)).toBeInTheDocument();
    expect(screen.getByText(/Məcburi:/)).toBeInTheDocument();
  });

  it('handles different field types correctly', () => {
    const extendedCategory = {
      ...mockCategory,
      columns: [
        ...mockCategory.columns,
        {
          id: 'checkbox-field',
          name: 'Checkbox Field',
          type: 'checkbox' as const,
          is_required: false,
          placeholder: 'Check this'
        },
        {
          id: 'textarea-field',
          name: 'Textarea Field',
          type: 'textarea' as const,
          is_required: false,
          placeholder: 'Enter long text'
        }
      ]
    };

    render(
      <DataEntryForm 
        {...defaultProps} 
        category={extendedCategory}
      />
    );
    
    expect(screen.getByLabelText(/Checkbox Field/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Textarea Field/)).toBeInTheDocument();
  });
});