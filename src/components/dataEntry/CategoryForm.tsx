
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CategoryWithColumns } from '@/types/column';
import { FormField } from './FormFields';
import { EntryValue, DataEntryStatus } from '@/types/dataEntry';
import { Button } from '@/components/ui/button';

interface CategoryFormProps {
  category: CategoryWithColumns;
  values: EntryValue[];
  onChange: (columnId: string, value: string) => void;
  onSubmit?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  values,
  onChange,
  onSubmit,
  onApprove,
  onReject,
  isDisabled = false,
  isLoading = false,
}) => {
  // Sütunları sıra nömrəsinə görə sıralayırıq
  const sortedColumns = React.useMemo(() => {
    if (!category.columns) return [];
    return [...category.columns].sort((a, b) => {
      return (a.order_index || 0) - (b.order_index || 0);
    });
  }, [category.columns]);

  // Categoria statusuna görə badge rəngini təyin edirik
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'partial':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Təsdiqlənib';
      case 'pending':
        return 'Gözləmədə';
      case 'rejected':
        return 'Rədd edilib';
      case 'draft':
        return 'Qaralama';
      case 'partial':
        return 'Qismən';
      case 'active':
        return 'Aktiv';
      case 'inactive':
        return 'Deaktiv';
      default:
        return status;
    }
  };

  // Tamamlanma faizini hesablayırıq
  const completionPercentage = React.useMemo(() => {
    if (category.completionPercentage !== undefined) {
      return category.completionPercentage;
    }
    
    const totalFields = sortedColumns.length;
    if (totalFields === 0) return 0;
    
    const filledFields = values.filter(v => v.value !== '').length;
    return Math.round((filledFields / totalFields) * 100);
  }, [category.completionPercentage, sortedColumns.length, values]);

  // Təsdiq və ya rədd edilmiş formları göstərmək üçün buttonlar
  const renderActionButtons = () => {
    // Əgər onSubmit funksiyası varsa buttonları göstəririk
    if (onSubmit) {
      return (
        <div className="flex justify-end gap-2 mt-4">
          <Button 
            variant="outline" 
            onClick={onSubmit} 
            disabled={isDisabled || isLoading}
          >
            Təsdiqə göndər
          </Button>
        </div>
      );
    }
    
    // Əgər onApprove və onReject funksiyaları varsa və status pending-dirsə
    const statusStr = typeof category.status === 'string' ? category.status : '';
    if (onApprove && onReject && statusStr === 'pending') {
      return (
        <div className="flex justify-end gap-2 mt-4">
          <Button 
            variant="outline" 
            onClick={onReject} 
            className="text-red-500" 
            disabled={isDisabled || isLoading}
          >
            Rədd et
          </Button>
          <Button 
            variant="default" 
            onClick={onApprove} 
            disabled={isDisabled || isLoading}
          >
            Təsdiqlə
          </Button>
        </div>
      );
    }

    // Əgər status approved və ya pending deyilsə, boş div qaytarırıq
    if (statusStr !== 'approved' && statusStr !== 'pending') {
      return (
        <div className="flex justify-end gap-2 mt-4">
          <Button 
            variant="outline" 
            onClick={onSubmit} 
            disabled={isDisabled || isLoading || !onSubmit}
          >
            Yadda saxla
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <div>
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium">{category.name}</CardTitle>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(category.status as string)}`}>
              {getStatusText(category.status as string)}
            </span>
          </div>
          <CardDescription>
            {category.description || 'Bu kateqoriya üçün məlumatları daxil edin.'}
          </CardDescription>
          <div className="mt-2">
            <Progress value={completionPercentage} className="h-2" />
            <p className="text-xs text-gray-500 mt-1">Tamamlama: {completionPercentage}%</p>
          </div>
        </CardHeader>
        <CardContent>
          {sortedColumns.map((column) => {
            // Sütuna aid dəyəri tapırıq
            const entry = values.find(val => val.columnId === column.id);
            return (
              <FormField
                key={column.id}
                column={column}
                value={entry?.value || ''}
                status={entry?.status as DataEntryStatus}
                onChange={(value) => onChange(column.id, value)}
                isDisabled={isDisabled}
                error={entry?.error}
              />
            );
          })}
          
          {/* Təsdiq və ya rədd etmək üçün buttonlar */}
          {renderActionButtons()}
        </CardContent>
      </Card>
    </div>
  );
};
