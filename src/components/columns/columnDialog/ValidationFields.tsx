
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Control } from 'react-hook-form';
import { ColumnType } from '@/types/column';

export interface ValidationFieldsProps {
  control: Control<any>;
  type: ColumnType;
}

const ValidationFields: React.FC<ValidationFieldsProps> = ({ control, type }) => {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="is_required"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Məcburidir</FormLabel>
              <FormDescription>
                Bu sahə doldurulmalıdır
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      {type === 'text' || type === 'textarea' || type === 'email' || type === 'url' ? (
        <>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="validation.minLength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum uzunluq</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="validation.maxLength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maksimum uzunluq</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="255"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          {type === 'text' || type === 'email' || type === 'url' ? (
            <FormField
              control={control}
              name="validation.pattern"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Şablon (Regex)</FormLabel>
                  <FormControl>
                    <Input placeholder="^[a-zA-Z0-9]+$" {...field} />
                  </FormControl>
                  <FormDescription>
                    JavaScript Regex formatında daxil edin
                  </FormDescription>
                </FormItem>
              )}
            />
          ) : null}
        </>
      ) : null}

      {type === 'number' && (
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="validation.minValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum dəyər</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="validation.maxValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maksimum dəyər</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="100"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      )}

      {type === 'date' && (
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="validation.minValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum tarix</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="validation.maxValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maksimum tarix</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default ValidationFields;
