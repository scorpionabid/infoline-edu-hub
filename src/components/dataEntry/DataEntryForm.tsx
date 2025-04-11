
import React, { useEffect } from 'react';
import { useDataEntry } from '@/hooks/useDataEntry';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';
import DatePicker from '@/components/ui/date-picker';

interface DataEntryFormProps {
  initialCategoryId?: string;
  statusFilter?: string;
  onDataChanged?: () => void;
  readOnly?: boolean;
}

const DataEntryForm: React.FC<DataEntryFormProps> = ({ 
  initialCategoryId, 
  statusFilter, 
  onDataChanged,
  readOnly = false
}) => {
  const { t } = useLanguage();
  const { 
    categories, 
    currentCategoryIndex, 
    formData, 
    errors, 
    updateValue, 
    getErrorForColumn
  } = useDataEntry(initialCategoryId, statusFilter);
  
  const currentCategory = categories[currentCategoryIndex];
  
  const handleValueChange = (columnId: string, value: any) => {
    updateValue(currentCategory.id, columnId, value);
    if (onDataChanged) {
      onDataChanged();
    }
  };
  
  // Sütun tipinə görə müvafiq input komponenti render edir
  const renderInputByType = (column: any) => {
    const currentEntry = formData.entries.find(e => e.categoryId === currentCategory.id);
    const valueObj = currentEntry?.values.find(v => v.columnId === column.id);
    const value = valueObj?.value || '';
    const error = getErrorForColumn(column.id);
    const isApproved = valueObj?.status === 'approved';
    const isRejected = valueObj?.status === 'rejected';
    
    // Əgər readOnly rejimindədirsə və ya sütun təsdiqlənibsə, disabled olmalıdır
    const isDisabled = readOnly || isApproved;
    
    const inputClassName = `w-full ${isRejected ? 'border-destructive' : ''} ${isApproved ? 'bg-muted' : ''}`;
    
    switch (column.type) {
      case 'text':
        return (
          <Input
            id={column.id}
            type="text"
            value={value as string}
            onChange={(e) => handleValueChange(column.id, e.target.value)}
            placeholder={column.placeholder || ''}
            className={inputClassName}
            disabled={isDisabled}
          />
        );
        
      case 'number':
        return (
          <Input
            id={column.id}
            type="number"
            value={value as number}
            onChange={(e) => handleValueChange(column.id, e.target.value)}
            placeholder={column.placeholder || ''}
            className={inputClassName}
            disabled={isDisabled}
          />
        );
        
      case 'date':
        return (
          <DatePicker
            id={column.id}
            date={value ? new Date(value as string) : undefined}
            onSelect={(date) => handleValueChange(column.id, date?.toISOString())}
            disabled={isDisabled}
          />
        );
        
      case 'textarea':
        return (
          <Textarea
            id={column.id}
            value={value as string}
            onChange={(e) => handleValueChange(column.id, e.target.value)}
            placeholder={column.placeholder || ''}
            className={inputClassName}
            disabled={isDisabled}
          />
        );
        
      case 'checkbox':
        return (
          <Checkbox
            id={column.id}
            checked={value as boolean}
            onCheckedChange={(checked) => handleValueChange(column.id, checked)}
            disabled={isDisabled}
          />
        );
        
      case 'radio':
        return (
          <RadioGroup
            value={value as string}
            onValueChange={(val) => handleValueChange(column.id, val)}
            className="flex flex-col space-y-1"
            disabled={isDisabled}
          >
            {column.options?.map((option: any) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${column.id}-${option.value}`} />
                <Label htmlFor={`${column.id}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        );
        
      case 'select':
        return (
          <Select
            value={value as string}
            onValueChange={(val) => handleValueChange(column.id, val)}
            disabled={isDisabled}
          >
            <SelectTrigger className={inputClassName}>
              <SelectValue placeholder={column.placeholder || t('select')} />
            </SelectTrigger>
            <SelectContent>
              {column.options?.map((option: any) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        
      default:
        return (
          <Input
            id={column.id}
            type="text"
            value={value as string}
            onChange={(e) => handleValueChange(column.id, e.target.value)}
            placeholder={column.placeholder || ''}
            className={inputClassName}
            disabled={isDisabled}
          />
        );
    }
  };
  
  if (!currentCategory || !currentCategory.columns || currentCategory.columns.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">{t('noCategoryData')}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {readOnly && (
        <Alert variant="default" className="bg-muted">
          <Info className="h-4 w-4" />
          <AlertDescription>
            {t('viewOnlyModeDescription')}
          </AlertDescription>
        </Alert>
      )}
      
      {currentCategory.columns.map((column) => {
        const error = getErrorForColumn(column.id);
        const currentEntry = formData.entries.find(e => e.categoryId === currentCategory.id);
        const valueObj = currentEntry?.values.find(v => v.columnId === column.id);
        const isRejected = valueObj?.status === 'rejected';
        const rejectionReason = valueObj?.errorMessage;
        
        return (
          <div key={column.id} className="space-y-2">
            <div className="flex items-start justify-between">
              <Label htmlFor={column.id} className={column.is_required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
                {column.name}
              </Label>
              {column.is_required && <span className="text-xs text-muted-foreground">{t('required')}</span>}
            </div>
            
            {column.help_text && (
              <p className="text-sm text-muted-foreground">{column.help_text}</p>
            )}
            
            {renderInputByType(column)}
            
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            
            {isRejected && rejectionReason && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{rejectionReason}</AlertDescription>
              </Alert>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DataEntryForm;
