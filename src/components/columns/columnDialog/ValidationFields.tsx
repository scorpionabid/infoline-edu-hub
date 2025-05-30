
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Control } from 'react-hook-form';
import { ColumnType } from '@/types/column';

interface ValidationFieldsProps {
  control: Control<any>;
  columnType: ColumnType;
}

const ValidationFields: React.FC<ValidationFieldsProps> = ({ control, columnType }) => {
  const showMinMax = ['number', 'text', 'textarea'].includes(columnType);
  const showPattern = ['text', 'email', 'phone'].includes(columnType);
  const showOptions = ['select', 'radio', 'multiselect'].includes(columnType);

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="is_required"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Required field</FormLabel>
            </div>
          </FormItem>
        )}
      />

      {showMinMax && (
        <>
          <FormField
            control={control}
            name="validation.min"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum {columnType === 'number' ? 'value' : 'length'}</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Enter minimum value"
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="validation.max"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum {columnType === 'number' ? 'value' : 'length'}</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Enter maximum value"
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}

      {showPattern && (
        <FormField
          control={control}
          name="validation.pattern"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pattern (regex)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter regex pattern"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

export default ValidationFields;
