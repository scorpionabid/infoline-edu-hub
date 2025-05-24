
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { BasicColumnFieldsProps, columnTypeDefinitions } from '@/types/column';

const BasicColumnFields: React.FC<BasicColumnFieldsProps> = ({
  control,
  errors,
  watch,
  categories = [],
  selectedType,
  onTypeChange,
  isEditMode = false
}) => {
  return (
    <div className="space-y-6">
      {/* Column name */}
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sütun adı *</FormLabel>
            <FormControl>
              <Input placeholder="Sütun adını daxil edin" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Column type */}
      <FormField
        control={control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sütun tipi *</FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  onTypeChange?.(value as any);
                }}
                disabled={isEditMode}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sütun tipini seçin" />
                </SelectTrigger>
                <SelectContent>
                  {columnTypeDefinitions.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <span>{type.icon}</span>
                        <div>
                          <div>{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Required field */}
      <FormField
        control={control}
        name="is_required"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <FormLabel>Məcburi sahə</FormLabel>
              <p className="text-sm text-muted-foreground">
                Bu sahə doldurulması məcburi olsun
              </p>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {/* Placeholder */}
      <FormField
        control={control}
        name="placeholder"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Placeholder</FormLabel>
            <FormControl>
              <Input placeholder="Sahə üçün placeholder mətni" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Help text */}
      <FormField
        control={control}
        name="help_text"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Kömək mətni</FormLabel>
            <FormControl>
              <Textarea placeholder="Sahə haqqında açıqlama" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Default value */}
      <FormField
        control={control}
        name="default_value"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Varsayılan dəyər</FormLabel>
            <FormControl>
              <Input placeholder="Varsayılan dəyər" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default BasicColumnFields;
