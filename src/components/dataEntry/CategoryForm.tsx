
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormFields } from './FormFields';
import { CategoryWithColumns } from '@/types/column';
import { DataEntryStatus, EntryValue } from '@/types/dataEntry'; 
import { StatusIndicator } from './StatusIndicators';
import { useLanguage } from '@/context/LanguageContext';

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
  const { t } = useLanguage();
  
  // Status və tamamlama faizini hesabla
  const status: DataEntryStatus | 'partial' = 'pending';
  const completionPercentage = calculateCompletionPercentage(category.columns, values);
  
  // Status badge rəngini qaytarır
  const getStatusBadgeColor = (status: DataEntryStatus | 'partial') => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'partial':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Statusun mətnini qaytarır
  const getStatusLabel = (status: DataEntryStatus | 'partial') => {
    switch (status) {
      case 'approved':
        return t('approved');
      case 'pending':
        return t('pending');
      case 'rejected':
        return t('rejected');
      case 'draft':
        return t('draft');
      case 'partial':
        return t('partial');
      default:
        return t('unknown');
    }
  };

  // Hesabla - validasiya xətaları varmı
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

// Tamamlanma faizini hesablamaq üçün funksiya
function calculateCompletionPercentage(columns: any[], values: EntryValue[]): number {
  if (!columns.length) return 0;
  
  // Məcburi sütunları tap
  const requiredColumns = columns.filter(col => col.is_required);
  
  // Tamamlanmış sütunları tap
  const completedEntries = values.filter(entry => entry.value && entry.value.trim() !== '');
  
  // Əgər heç bir məcburi sütun yoxdursa
  if (!requiredColumns.length) {
    return completedEntries.length > 0 ? 100 : 0;
  }
  
  // Məcburi sütunların neçəsi doldurulub
  const filledRequiredColumns = requiredColumns.filter(column => 
    values.some(entry => entry.columnId === column.id && entry.value && entry.value.trim() !== '')
  );
  
  return Math.round((filledRequiredColumns.length / requiredColumns.length) * 100);
}

export default CategoryForm;
