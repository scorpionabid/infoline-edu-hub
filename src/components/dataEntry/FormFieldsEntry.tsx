
import React from 'react';
import { Column } from '@/types/column';
import { FormField } from './FormField';

interface FormFieldsEntryProps {
  columns: Column[];
  initialEntries?: any[];
  onSave?: (entries: any[]) => Promise<void>;
  loading?: boolean;
  categoryId?: string;
}

const FormFieldsEntry: React.FC<FormFieldsEntryProps> = ({ 
  columns, 
  initialEntries = [], 
  onSave, 
  loading = false,
  categoryId
}) => {
  // Sütunlar üzrə sahələri göstərir və dəyərləri idarə edirik
  
  return (
    <div>
      {/* Form sahələri və dəyərlərin idarə olunması */}
      Fields Entry Component
    </div>
  );
};

export default FormFieldsEntry;
