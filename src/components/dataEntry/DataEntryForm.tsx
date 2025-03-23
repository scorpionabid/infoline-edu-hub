
import React from 'react';
import { CategoryWithColumns, Column } from '@/types/column';
import { CategoryEntryData, EntryValue } from '@/types/dataEntry';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';

interface DataEntryFormProps {
  category: CategoryWithColumns;
  entryData: CategoryEntryData;
  onValueChange: (categoryId: string, columnId: string, value: any) => void;
  getErrorForColumn: (columnId: string) => string | undefined;
  isSubmitted: boolean;
}

const DataEntryForm: React.FC<DataEntryFormProps> = ({
  category,
  entryData,
  onValueChange,
  getErrorForColumn,
  isSubmitted
}) => {
  const form = useForm();

  const getValueForColumn = (columnId: string): any => {
    const value = entryData.values.find(v => v.columnId === columnId)?.value;
    return value !== undefined ? value : '';
  };

  const renderFormField = (column: Column) => {
    const errorMessage = getErrorForColumn(column.id);
    const isDisabled = isSubmitted;
    
    return (
      <div key={column.id} className="mb-6">
        <FormItem className="space-y-2">
          <FormLabel className="flex items-center space-x-2">
            <span>{column.name}</span>
            {column.isRequired && <span className="text-red-500">*</span>}
          </FormLabel>
          
          {column.type === 'text' && (
            <FormControl>
              <Input
                value={getValueForColumn(column.id) || ''}
                onChange={(e) => onValueChange(category.id, column.id, e.target.value)}
                placeholder={column.placeholder || `${column.name} daxil edin`}
                className={errorMessage ? 'border-red-500' : ''}
                disabled={isDisabled}
              />
            </FormControl>
          )}
          
          {column.type === 'number' && (
            <FormControl>
              <Input
                type="number"
                value={getValueForColumn(column.id) || ''}
                onChange={(e) => onValueChange(category.id, column.id, e.target.value ? Number(e.target.value) : '')}
                placeholder={column.placeholder || `${column.name} daxil edin`}
                className={errorMessage ? 'border-red-500' : ''}
                disabled={isDisabled}
              />
            </FormControl>
          )}
          
          {column.type === 'select' && column.options && (
            <Select
              defaultValue={getValueForColumn(column.id) || ''}
              onValueChange={(value) => onValueChange(category.id, column.id, value)}
              disabled={isDisabled}
            >
              <FormControl>
                <SelectTrigger className={errorMessage ? 'border-red-500' : ''}>
                  <SelectValue placeholder={column.placeholder || 'Seçin'} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {column.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {column.type === 'date' && (
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !getValueForColumn(column.id) && "text-muted-foreground",
                      errorMessage && "border-red-500"
                    )}
                    disabled={isDisabled}
                  >
                    {getValueForColumn(column.id) ? (
                      format(new Date(getValueForColumn(column.id)), 'PP')
                    ) : (
                      <span>Tarix seçin</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={getValueForColumn(column.id) ? new Date(getValueForColumn(column.id)) : undefined}
                  onSelect={(date) => onValueChange(category.id, column.id, date)}
                  disabled={isDisabled}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          )}
          
          {column.type === 'checkbox' && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id={column.id}
                checked={!!getValueForColumn(column.id)}
                onCheckedChange={(checked) => onValueChange(category.id, column.id, checked)}
                disabled={isDisabled}
              />
              <label
                htmlFor={column.id}
                className="text-sm text-muted-foreground"
              >
                {column.placeholder || 'Seçin'}
              </label>
            </div>
          )}
          
          {column.helpText && (
            <FormDescription>
              {column.helpText}
            </FormDescription>
          )}
          
          {errorMessage && (
            <FormMessage>
              {errorMessage}
            </FormMessage>
          )}
        </FormItem>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-4">{category.name}</h3>
      
      <Form {...form}>
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {category.columns.map(column => renderFormField(column))}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default DataEntryForm;
