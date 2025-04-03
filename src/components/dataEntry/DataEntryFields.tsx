
import React from 'react';
import { Column } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DataEntryFieldsProps {
  columns: Column[];
  groupedColumns: Record<string, Column[]>;
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

  // Tarix seçimi üçün yardımçı funksiya
  const handleDateChange = (date: Date | undefined, columnId: string) => {
    if (date) {
      onChange(columnId, date.toISOString());
    }
  };

  // Checkbox seçimi üçün yardımçı funksiya
  const handleCheckboxChange = (checked: boolean, columnId: string) => {
    onChange(columnId, checked ? 'true' : 'false');
  };

  // Select seçimi üçün yardımçı funksiya
  const handleSelectChange = (value: string, columnId: string) => {
    onChange(columnId, value);
  };

  // Radio seçimi üçün yardımçı funksiya
  const handleRadioChange = (value: string, columnId: string) => {
    onChange(columnId, value);
  };

  // Sütunun tipinə görə uyğun input komponenti göstərir
  const renderField = (column: Column) => {
    const value = entries[column.id] || '';
    const error = errors[column.id];

    switch (column.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <Input
            id={column.id}
            type={column.type === 'email' ? 'email' : column.type === 'phone' ? 'tel' : 'text'}
            placeholder={column.placeholder}
            value={value}
            onChange={(e) => onChange(column.id, e.target.value)}
            disabled={isReadOnly}
            className={cn(error ? "border-red-500" : "")}
          />
        );

      case 'number':
        return (
          <Input
            id={column.id}
            type="number"
            placeholder={column.placeholder}
            value={value}
            onChange={(e) => onChange(column.id, e.target.value)}
            disabled={isReadOnly}
            className={cn(error ? "border-red-500" : "")}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={column.id}
            placeholder={column.placeholder}
            value={value}
            onChange={(e) => onChange(column.id, e.target.value)}
            disabled={isReadOnly}
            className={cn(error ? "border-red-500" : "")}
          />
        );

      case 'select':
        const options = Array.isArray(column.options) 
          ? column.options.map(opt => typeof opt === 'string' ? { label: opt, value: opt } : opt)
          : [];

        return (
          <Select
            value={value}
            onValueChange={(newValue) => handleSelectChange(newValue, column.id)}
            disabled={isReadOnly}
          >
            <SelectTrigger className={cn(error ? "border-red-500" : "")}>
              <SelectValue placeholder={column.placeholder || t('selectOption')} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option, index) => (
                <SelectItem key={`${option.value}-${index}`} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiselect':
        // Multiselect burada daha mürəkkəb ola bilər, sadəlik üçün hələlik select kimi təmsil edirik
        const multiselectOptions = Array.isArray(column.options) 
          ? column.options.map(opt => typeof opt === 'string' ? { label: opt, value: opt } : opt)
          : [];

        return (
          <Select
            value={value}
            onValueChange={(newValue) => handleSelectChange(newValue, column.id)}
            disabled={isReadOnly}
          >
            <SelectTrigger className={cn(error ? "border-red-500" : "")}>
              <SelectValue placeholder={column.placeholder || t('selectMultipleOptions')} />
            </SelectTrigger>
            <SelectContent>
              {multiselectOptions.map((option, index) => (
                <SelectItem key={`${option.value}-${index}`} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              id={column.id}
              checked={value === 'true'}
              onCheckedChange={(checked) => handleCheckboxChange(checked as boolean, column.id)}
              disabled={isReadOnly}
              className={cn(error ? "border-red-500" : "")}
            />
            <label
              htmlFor={column.id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {column.placeholder || column.name}
            </label>
          </div>
        );

      case 'radio':
        const radioOptions = Array.isArray(column.options) 
          ? column.options.map(opt => typeof opt === 'string' ? { label: opt, value: opt } : opt)
          : [];

        return (
          <RadioGroup
            value={value}
            onValueChange={(newValue) => handleRadioChange(newValue, column.id)}
            disabled={isReadOnly}
            className="space-y-2"
          >
            {radioOptions.map((option, index) => (
              <div key={`${option.value}-${index}`} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${column.id}-${option.value}`} />
                <Label htmlFor={`${column.id}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'date':
        const dateValue = value ? new Date(value) : undefined;
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={isReadOnly}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !value && "text-muted-foreground",
                  error ? "border-red-500" : ""
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(dateValue as Date, 'PPP') : <span>{column.placeholder || t('selectDate')}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateValue}
                onSelect={(date) => handleDateChange(date, column.id)}
                disabled={(date) => isReadOnly}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      default:
        return (
          <Input
            id={column.id}
            placeholder={column.placeholder}
            value={value}
            onChange={(e) => onChange(column.id, e.target.value)}
            disabled={isReadOnly}
            className={cn(error ? "border-red-500" : "")}
          />
        );
    }
  };

  // Alt sütunları göstərmək üçün rekursiv funksiya
  const renderNestedColumns = (parentId: string) => {
    if (!groupedColumns[parentId]) return null;

    return (
      <div className="space-y-4 mt-2">
        {groupedColumns[parentId].map((column) => (
          <div key={column.id} className="space-y-2">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label
                  htmlFor={column.id}
                  className={cn(
                    "block text-sm font-medium",
                    column.isRequired ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""
                  )}
                >
                  {column.name}
                </Label>
                {column.helpText && (
                  <p className="text-xs text-muted-foreground mt-0.5">{column.helpText}</p>
                )}
                <div className="mt-1">{renderField(column)}</div>
                {errors[column.id] && (
                  <p className="mt-1 text-xs text-red-500">{errors[column.id]}</p>
                )}
              </div>
            </div>

            {/* Alt sütunlar üçün */}
            {groupedColumns[column.id] && renderNestedColumns(column.id)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {columns.map((column) => {
        // Əgər bu sütun başqa bir sütunun alt sütunudursa, onu buraxırıq
        if (column.parentColumnId) return null;

        const hasChildren = groupedColumns[column.id] && groupedColumns[column.id].length > 0;

        return (
          <div key={column.id} className="space-y-2">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label
                  htmlFor={column.id}
                  className={cn(
                    "block text-sm font-medium",
                    column.isRequired ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""
                  )}
                >
                  {column.name}
                </Label>
                {column.helpText && (
                  <p className="text-xs text-muted-foreground mt-0.5">{column.helpText}</p>
                )}
                <div className="mt-1">{renderField(column)}</div>
                {errors[column.id] && (
                  <p className="mt-1 text-xs text-red-500">{errors[column.id]}</p>
                )}
              </div>
            </div>

            {/* Əgər alt sütunlar varsa, onları accordion ilə göstəririk */}
            {hasChildren && (
              <Accordion type="single" collapsible className="mt-2">
                <AccordionItem value="children">
                  <AccordionTrigger className="text-sm">{t('showRelatedFields')}</AccordionTrigger>
                  <AccordionContent>
                    {renderNestedColumns(column.id)}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DataEntryFields;
