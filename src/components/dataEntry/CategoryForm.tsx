
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormFields } from './FormFields';
import { CategoryWithColumns } from '@/types/column';
import { EntryValue } from '@/types/dataEntry';
import { StatusIndicator } from './StatusIndicators';
import { useCategoryStatus } from '@/hooks/categories/useCategoryStatus';

interface CategoryFormProps {
  category: CategoryWithColumns;
  values: EntryValue[];
  onChange: (columnId: string, value: string) => void;
  onSubmit: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
}

export function CategoryForm({
  category,
  values,
  onChange,
  onSubmit,
  onApprove,
  onReject,
  isDisabled = false,
  isLoading = false
}: CategoryFormProps) {
  const { status, completionPercentage, getStatusBadgeColor, getStatusLabel } = useCategoryStatus(category, { 
    entries: values.map(v => ({
      school_id: '',
      category_id: category.id,
      column_id: v.column_id,
      value: v.value,
      status: v.status
    }))
  });

  // Hesabla - valideysion xətaları varmı
  const hasValidationErrors = values.some(v => v.isValid === false);
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-muted/50">
        <div className="flex items-center justify-between">
          <CardTitle>{category.name}</CardTitle>
          <div className="flex items-center space-x-2">
            <StatusIndicator 
              status={status} 
              label={getStatusLabel(status)} 
              color={getStatusBadgeColor(status)} 
            />
            <div className="text-sm font-medium text-muted-foreground">
              {completionPercentage || 0}% tamamlanıb
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-4">
        <FormFields 
          columns={category.columns} 
          values={values} 
          onChange={onChange}
          disabled={isDisabled || status === 'approved'} 
        />
      </CardContent>
      <CardFooter className="flex justify-between border-t bg-muted/50 px-6 py-3">
        <div className="text-sm text-muted-foreground">
          {category.deadline && (
            <span>Son tarix: {new Date(category.deadline).toLocaleDateString()}</span>
          )}
        </div>
        <div className="flex space-x-2">
          {onApprove && (
            <Button 
              variant="default" 
              size="sm" 
              onClick={onApprove}
              disabled={isLoading || isDisabled || hasValidationErrors}
            >
              Təsdiqlə
            </Button>
          )}
          {onReject && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={onReject}
              disabled={isLoading || isDisabled}
            >
              Rədd et
            </Button>
          )}
          <Button 
            variant="default" 
            size="sm" 
            onClick={onSubmit}
            disabled={isLoading || isDisabled || hasValidationErrors}
          >
            {isLoading ? 'İşləyir...' : 'Göndər'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default CategoryForm;
