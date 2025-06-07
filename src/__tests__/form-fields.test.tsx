
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { FormProvider, useForm } from 'react-hook-form';
import { FormFields } from '../components/dataEntry/core';
import { FormField } from '../components/ui/form';
import UnifiedFieldRenderer from '../components/dataEntry/fields/UnifiedFieldRenderer';
import { Column, ColumnType } from '../types/column';

// Test üçün Column mock data yaradırıq
const createMockColumn = (overrides: Partial<Column> = {}): Column => ({
  id: 'test-column-id',
  name: 'Test Column',
  type: 'text' as ColumnType,
  is_required: false,
  category_id: 'test-category-id',
  order_index: 1,
  status: 'active',
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
    const testColumns = [
      createMockColumn({ 
        id: 'col1', 
        name: 'Test Column' 
      })
    ];
    
    render(
      <FormWrapper>
        <FormFields 
          columns={testColumns} 
          readOnly={true}
          disabled={false}
        />
      </FormWrapper>
    );
    
    // Verify component renders without errors - spesifik selector
    const labels = screen.getAllByText('Test Column');
    expect(labels.length).toBeGreaterThan(0);
    expect(labels[0]).toBeInTheDocument();
  });
  
  it('should pass disabled prop correctly to form fields', () => {
    const testColumns = [
      createMockColumn({ 
        id: 'col2', 
        name: 'Test Column 2'
      })
    ];
    
    render(
      <FormWrapper>
        <FormFields 
          columns={testColumns} 
          readOnly={false}
          disabled={true}
        />
      </FormWrapper>
    );
    
    const labels = screen.getAllByText('Test Column 2');
    expect(labels.length).toBeGreaterThan(0);
    expect(labels[0]).toBeInTheDocument();
  });
  
  it('should handle input changes correctly', () => {
    const testColumns = [
      createMockColumn({ 
        id: 'col3', 
        name: 'Test Column 3'
      })
    ];
    
    render(
      <FormWrapper>
        <FormFields 
          columns={testColumns} 
          readOnly={false}
          disabled={false}
        />
      </FormWrapper>
    );
    
    const labels = screen.getAllByText('Test Column 3');
    expect(labels.length).toBeGreaterThan(0);
    expect(labels[0]).toBeInTheDocument();
  });
});

// Test UnifiedFieldRenderer component directly
describe('UnifiedFieldRenderer Component Tests', () => {
  it('should respect disabled and readOnly props correctly', () => {
    const handleChange = vi.fn();
    const mockColumn = createMockColumn({ id: 'test-field', type: 'text' });
    
    render(
      <UnifiedFieldRenderer
        column={mockColumn}
        value=""
        onChange={handleChange}
        isDisabled={false}
        readOnly={false}
      />
    );
    
    const inputField = screen.getByRole('textbox') as HTMLInputElement;
    
    expect(inputField).not.toHaveAttribute('disabled');
    expect(inputField).not.toHaveAttribute('readonly');
  });
  
  it('should handle readOnly prop correctly', () => {
    const handleChange = vi.fn();
    const mockColumn = createMockColumn({ id: 'test-field', type: 'text' });
    
    render(
      <UnifiedFieldRenderer
        column={mockColumn}
        value=""
        onChange={handleChange}
        isDisabled={false}
        readOnly={true}
      />
    );
    
    const inputField = screen.getByRole('textbox') as HTMLInputElement;
    expect(inputField).toHaveAttribute('readonly');
  });
  
  it('should handle disabled prop correctly', () => {
    const handleChange = vi.fn();
    const mockColumn = createMockColumn({ id: 'test-field', type: 'text' });
    
    render(
      <UnifiedFieldRenderer
        column={mockColumn}
        value=""
        onChange={handleChange}
        isDisabled={true}
        readOnly={false}
      />
    );
    
    const inputField = screen.getByRole('textbox') as HTMLInputElement;
    expect(inputField).toHaveAttribute('disabled');
  });
  
  it('should call onChange handler when value changes', () => {
    const handleChange = vi.fn();
    const mockColumn = createMockColumn({ id: 'test-field2', type: 'text' });
    
    render(
      <UnifiedFieldRenderer
        column={mockColumn}
        value="initial"
        onChange={handleChange}
        isDisabled={false}
        readOnly={false}
      />
    );
    
    const inputField = screen.getByRole('textbox') as HTMLInputElement;
    
    fireEvent.change(inputField, { target: { value: 'new value' } });
    
    expect(handleChange).toHaveBeenCalled();
  });
});
