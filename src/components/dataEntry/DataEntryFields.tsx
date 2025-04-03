
import React, { useState, useEffect } from 'react';
import { Column, ColumnType } from '@/types/column';
import { 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { useLanguage } from '@/context/LanguageContext';
import { format } from 'date-fns';
import { 
  CalendarIcon, 
  Check, 
  FileQuestion, 
  Image as ImageIcon,
  Info 
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';

interface DataEntryFieldsProps {
  columns: Column[];
  groupedColumns: { [key: string]: Column[] };
  entries: { [key: string]: string };
  errors: { [key: string]: string };
  isReadOnly?: boolean;
  onChange: (columnId: string, value: string) => void;
}

const DataEntryFields: React.FC<DataEntryFieldsProps> = ({
  columns,
  groupedColumns,
  entries,
  errors,
  isReadOnly = false,
  onChange
}) => {
  const { t } = useLanguage();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroupExpand = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const renderField = (column: Column) => {
    const value = entries[column.id] || '';
    const error = errors[column.id];
    
    switch (column.type as ColumnType) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <Input
            id={column.id}
            value={value}
            onChange={(e) => onChange(column.id, e.target.value)}
            placeholder={column.placeholder}
            readOnly={isReadOnly}
            className={error ? 'border-red-500' : ''}
          />
        );
        
      case 'textarea':
        return (
          <Textarea
            id={column.id}
            value={value}
            onChange={(e) => onChange(column.id, e.target.value)}
            placeholder={column.placeholder}
            rows={4}
            readOnly={isReadOnly}
            className={error ? 'border-red-500' : ''}
          />
        );
        
      case 'number':
        return (
          <Input
            id={column.id}
            type="number"
            value={value}
            onChange={(e) => onChange(column.id, e.target.value)}
            placeholder={column.placeholder}
            min={column.validation?.min}
            max={column.validation?.max}
            readOnly={isReadOnly}
            className={error ? 'border-red-500' : ''}
          />
        );
        
      case 'select':
        return (
          <Select
            disabled={isReadOnly}
            value={value}
            onValueChange={(val) => onChange(column.id, val)}
          >
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder={column.placeholder || t('selectAnOption')} />
            </SelectTrigger>
            <SelectContent>
              {Array.isArray(column.options) && column.options.map((option, i) => {
                const optionValue = typeof option === 'string' ? option : option.value;
                const optionLabel = typeof option === 'string' ? option : option.label;
                
                return (
                  <SelectItem key={i} value={optionValue}>
                    {optionLabel}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        );
        
      case 'multiselect':
        // Handle multiselect similar to select but with multiple values
        return (
          <div className={`border rounded-md p-2 ${error ? 'border-red-500' : ''}`}>
            {Array.isArray(column.options) && column.options.map((option, i) => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;
              const isSelected = value.split(',').includes(optionValue);
              
              return (
                <div key={i} className="flex items-center space-x-2 mb-1">
                  <Checkbox
                    id={`${column.id}-${i}`}
                    checked={isSelected}
                    disabled={isReadOnly}
                    onCheckedChange={(checked) => {
                      const currentValues = value ? value.split(',') : [];
                      let newValues = [];
                      
                      if (checked) {
                        if (!currentValues.includes(optionValue)) {
                          newValues = [...currentValues, optionValue];
                        } else {
                          newValues = currentValues;
                        }
                      } else {
                        newValues = currentValues.filter(v => v !== optionValue);
                      }
                      
                      onChange(column.id, newValues.join(','));
                    }}
                  />
                  <label
                    htmlFor={`${column.id}-${i}`}
                    className={`text-sm leading-none peer-disabled:opacity-70 ${isReadOnly ? 'opacity-70' : ''}`}
                  >
                    {optionLabel}
                  </label>
                </div>
              );
            })}
          </div>
        );
        
      case 'checkbox':
        return (
          <Checkbox
            id={column.id}
            checked={value === 'true'}
            disabled={isReadOnly}
            onCheckedChange={(checked) => {
              onChange(column.id, String(checked));
            }}
          />
        );
        
      case 'radio':
        return (
          <RadioGroup
            value={value}
            onValueChange={(val) => onChange(column.id, val)}
            disabled={isReadOnly}
            className={`space-y-1 ${error ? 'text-red-500' : ''}`}
          >
            {Array.isArray(column.options) && column.options.map((option, i) => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;
              
              return (
                <div key={i} className="flex items-center space-x-2">
                  <RadioGroupItem value={optionValue} id={`${column.id}-${i}`} />
                  <label htmlFor={`${column.id}-${i}`} className="text-sm cursor-pointer">
                    {optionLabel}
                  </label>
                </div>
              );
            })}
          </RadioGroup>
        );
        
      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !value && "text-muted-foreground",
                  error && "border-red-500"
                )}
                disabled={isReadOnly}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), "PPP") : <span>{t('pickADate')}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => onChange(column.id, date ? date.toISOString() : '')}
                initialFocus
                disabled={isReadOnly}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        );
        
      case 'file':
        return (
          <div className="flex items-center space-x-2">
            <Input
              id={column.id}
              type="file"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  onChange(column.id, e.target.files[0].name);
                }
              }}
              disabled={isReadOnly}
              className={error ? 'border-red-500' : ''}
            />
            {value && (
              <div className="flex items-center text-sm text-blue-600">
                <FileQuestion className="h-4 w-4 mr-1" />
                <span>{value.split('/').pop()}</span>
              </div>
            )}
          </div>
        );
        
      case 'image':
        return (
          <div>
            <Input
              id={column.id}
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  onChange(column.id, e.target.files[0].name);
                }
              }}
              disabled={isReadOnly}
              className={error ? 'border-red-500' : ''}
            />
            {value && (
              <div className="mt-2 border rounded p-2 flex items-center">
                <ImageIcon className="h-5 w-5 mr-2 text-blue-600" />
                <span className="text-sm">{value.split('/').pop()}</span>
              </div>
            )}
          </div>
        );
        
      default:
        return (
          <Input
            id={column.id}
            value={value}
            onChange={(e) => onChange(column.id, e.target.value)}
            placeholder={column.placeholder}
            readOnly={isReadOnly}
            className={error ? 'border-red-500' : ''}
          />
        );
    }
  };
  
  const renderAllColumns = (columns: Column[]) => {
    return columns.map((column) => (
      <FormField
        key={column.id}
        name={column.id}
        render={() => (
          <FormItem>
            <div className="flex items-start justify-between">
              <FormLabel className="flex items-start">
                {column.name}
                {column.isRequired && <span className="ml-1 text-red-500">*</span>}
              </FormLabel>
              
              {column.helpText && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0 rounded-full">
                      <Info className="h-3 w-3" />
                      <span className="sr-only">{t('info')}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <p className="text-sm">{column.helpText}</p>
                  </PopoverContent>
                </Popover>
              )}
            </div>
            
            <FormControl>
              {renderField(column)}
            </FormControl>
            
            {errors[column.id] && (
              <FormMessage>{errors[column.id]}</FormMessage>
            )}
            
            {column.helpText && (
              <FormDescription className="text-xs">
                {column.helpText}
              </FormDescription>
            )}
          </FormItem>
        )}
      />
    ));
  };
  
  return (
    <div className="grid gap-6">
      {/* Ana sütunlar */}
      {renderAllColumns(columns)}
      
      {/* Əlavə sütun qrupları (əgər varsa) */}
      {Object.keys(groupedColumns).filter(groupId => groupId !== 'main').map((groupId) => {
        // Parent column'u tapırıq
        const parentColumn = columns.find(col => col.id === groupId);
        
        if (!parentColumn) return null;
        
        const isExpanded = expandedGroups[groupId] || false;
        const childColumns = groupedColumns[groupId];
        
        return (
          <div key={groupId} className="border rounded-md p-4">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleGroupExpand(groupId)}
            >
              <h3 className="text-lg font-medium">{parentColumn.name}</h3>
              <Button variant="ghost" size="sm">
                {isExpanded ? t('collapse') : t('expand')}
              </Button>
            </div>
            
            {isExpanded && (
              <div className="mt-4 grid gap-6">
                {renderAllColumns(childColumns)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DataEntryFields;
