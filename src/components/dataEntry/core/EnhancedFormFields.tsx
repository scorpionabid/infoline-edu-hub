import React from 'react';
import { Column } from '@/types/column';
import { EnhancedFormField } from '../fields/EnhancedFormField';

interface EnhancedFormFieldsProps {
  columns: Column[];
  formData: Record<string, any>;
  onChange: (columnId: string, value: any) => void;
  readOnly?: boolean;
  disabled?: boolean;
  showValidation?: boolean;
}

const EnhancedFormFields: React.FC<EnhancedFormFieldsProps> = ({
  columns,
  formData,
  onChange,
  readOnly = false,
  disabled = false,
  showValidation = true
}) => {
  if (!columns || columns.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="space-y-2">
          <p className="text-lg">Bu kateqoriya üçün heç bir sahə tapılmadı</p>
          <p className="text-sm">Admin tərəfindən sahələr əlavə edilənə qədər gözləyin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {columns.map((column, index) => (
        <div key={column.id} className="group">
          <EnhancedFormField
            column={column}
            value={formData[column.id] || ''}
            onChange={(value) => onChange(column.id, value)}
            disabled={disabled || readOnly}
            readOnly={readOnly}
            showValidation={showValidation}
          />
          
          {/* Progress indicator for long forms */}
          {columns.length > 5 && (
            <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="text-xs text-muted-foreground text-right">
                {index + 1} / {columns.length}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default EnhancedFormFields;
