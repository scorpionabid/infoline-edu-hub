import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { FormProvider, useForm } from 'react-hook-form';
import { FormFields } from '../components/dataEntry/core';
import { FormField } from '../components/ui/form';
import FieldRendererSimple from '../components/dataEntry/fields/FieldRendererSimple';
import type { Column } from '../types/column';

// Test üçün Column mock data yaradırıq
const createMockColumn = (overrides: Partial<Column> = {}): Column => ({
  id: 'test-column-id',
  name: 'Test Column',
  type: 'text',
  is_required: false,
  category_id: 'test-category-id',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
});

// Wrapper komponent FormProvider ilə birgə test etmək üçün
const FormWrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({
    defaultValues: {},
    mode: 'onChange'
  });
  
  return (
    <FormProvider {...methods}>
      {children}
    </FormProvider>
  );
};

describe('Form Fields Component Tests', () => {
  it('should pass readOnly prop correctly to form fields', () => {
    // Test columns with properly typed Column objects
    const testColumns = [
      createMockColumn({ 
        id: 'col1', 
        name: 'Test Column' 
      })
    ];
    
    // Render with readOnly=true
    render(
      <FormWrapper>
        <FormFields 
          columns={testColumns} 
          readOnly={true}
          disabled={false}
        />
      </FormWrapper>
    );
    
    // Verify readOnly is passed correctly
    try {
      const inputField = screen.getByTestId('field-col1');
      expect(inputField).toHaveAttribute('readonly');
      expect(inputField).not.toHaveAttribute('disabled');
    } catch (e) {
      console.error('Test failed at initial render:', e);
      throw e;
    }
  });
  
  it('should pass disabled prop correctly to form fields', () => {
    // Test columns with properly typed Column objects
    const testColumns = [
      createMockColumn({ 
        id: 'col2', 
        name: 'Test Column 2'
      })
    ];
    
    // Render with disabled=true
    render(
      <FormWrapper>
        <FormFields 
          columns={testColumns} 
          readOnly={false}
          disabled={true}
        />
      </FormWrapper>
    );
    
    // Verify disabled is passed correctly
    try {
      const inputField = screen.getByTestId('field-col2');
      expect(inputField).toHaveAttribute('disabled');
      expect(inputField).not.toHaveAttribute('readonly');
    } catch (e) {
      console.error('Test failed at initial render:', e);
      throw e;
    }
  });
  
  it('should handle input changes correctly', () => {
    // Test columns with properly typed Column objects
    const testColumns = [
      createMockColumn({ 
        id: 'col3', 
        name: 'Test Column 3'
      })
    ];
    
    // Render with both props false to allow interaction
    render(
      <FormWrapper>
        <FormFields 
          columns={testColumns} 
          readOnly={false}
          disabled={false}
        />
      </FormWrapper>
    );
    
    // Find input and attempt to change value
    const inputField = screen.getByTestId('field-col3') as HTMLInputElement;
    
    // Input should be interactive
    expect(inputField).not.toHaveAttribute('disabled');
    expect(inputField).not.toHaveAttribute('readonly');
    
    // Change value
    fireEvent.change(inputField, { target: { value: 'Test Input Value' } });
    
    // Value should change (via controlled component behavior)
    expect(inputField.value).toBe('Test Input Value');
  });
});

// Test FieldRendererSimple component directly
describe('FieldRendererSimple Component Tests', () => {
  it('should respect disabled and readOnly props correctly', () => {
    const handleChange = vi.fn();
    
    // Render component with various prop combinations
    const { rerender } = render(
      <FieldRendererSimple
        type="text"
        value=""
        onChange={handleChange}
        disabled={false}
        readOnly={false}
        id="test-field"
      />
    );
    
    // Get the input field
    const inputField = screen.getByTestId('field-test-field') as HTMLInputElement;
    
    // Neither disabled nor readOnly
    expect(inputField).not.toHaveAttribute('disabled');
    expect(inputField).not.toHaveAttribute('readonly');
    
    // Test with readOnly=true
    rerender(
      <FieldRendererSimple
        type="text"
        value=""
        onChange={handleChange}
        disabled={false}
        readOnly={true}
        id="test-field"
      />
    );
    
    // Should be readOnly but not disabled
    expect(inputField).not.toHaveAttribute('disabled');
    expect(inputField).toHaveAttribute('readonly');
    
    // Test with disabled=true
    rerender(
      <FieldRendererSimple
        type="text"
        value=""
        onChange={handleChange}
        disabled={true}
        readOnly={false}
        id="test-field"
      />
    );
    
    // Should be disabled but not readOnly
    expect(inputField).toHaveAttribute('disabled');
    expect(inputField).not.toHaveAttribute('readonly');
  });
  
  it('should call onChange handler when value changes', () => {
    const handleChange = vi.fn();
    
    render(
      <FieldRendererSimple
        type="text"
        value="initial"
        onChange={handleChange}
        disabled={false}
        readOnly={false}
        id="test-field2"
      />
    );
    
    // Get the input field
    const inputField = screen.getByTestId('field-test-field2') as HTMLInputElement;
    
    // Change value
    fireEvent.change(inputField, { target: { value: 'new value' } });
    
    // onChange should have been called
    expect(handleChange).toHaveBeenCalled();
  });
});
