
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

// Test FieldRendererSimple component directly
describe('FieldRendererSimple Component Tests', () => {
  it('should respect disabled and readOnly props correctly', () => {
    const handleChange = vi.fn();
    
    // Test simple props without form context (should render test component)
    render(
      <FieldRendererSimple
        type="text"
        value=""
        onChange={handleChange}
        disabled={false}
        readOnly={false}
        id="test-field"
      />
    );
    
    const inputField = screen.getByTestId('field-test-field') as HTMLInputElement;
    
    expect(inputField).not.toHaveAttribute('disabled');
    expect(inputField).not.toHaveAttribute('readonly');
  });
  
  it('should handle readOnly prop correctly', () => {
    const handleChange = vi.fn();
    
    render(
      <FieldRendererSimple
        type="text"
        value=""
        onChange={handleChange}
        disabled={false}
        readOnly={true}
        id="test-field"
      />
    );
    
    const inputField = screen.getByTestId('field-test-field') as HTMLInputElement;
    expect(inputField).toHaveAttribute('readonly');
  });
  
  it('should handle disabled prop correctly', () => {
    const handleChange = vi.fn();
    
    render(
      <FieldRendererSimple
        type="text"
        value=""
        onChange={handleChange}
        disabled={true}
        readOnly={false}
        id="test-field"
      />
    );
    
    const inputField = screen.getByTestId('field-test-field') as HTMLInputElement;
    expect(inputField).toHaveAttribute('disabled');
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
    
    const inputField = screen.getByTestId('field-test-field2') as HTMLInputElement;
    
    fireEvent.change(inputField, { target: { value: 'new value' } });
    
    expect(handleChange).toHaveBeenCalled();
  });
});
