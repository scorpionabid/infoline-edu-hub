
import React from 'react';
import { FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useFormContext } from 'react-hook-form';
import { ColumnFormValues } from '@/types/column';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';

interface ValidationFieldsProps {
  type: ColumnFormValues['type'];
}

const ValidationFields: React.FC<ValidationFieldsProps> = ({ type }) => {
  const { control } = useFormContext<ColumnFormValues>();

  // Tip türləri üçün uyğun validasiya sahələrini özəlləşdiririk
  const renderValidationFieldsForType = () => {
    switch (type) {
      case 'number':
        return (
          <>
            {/* Minimum dəyər */}
            <FormField
              control={control}
              name="validation.min"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum dəyər</FormLabel>
                  <Input
                    type="number"
                    placeholder="Minimum dəyər daxil edin"
                    {...field}
                  />
                  <FormDescription>
                    Ədəd üçün minimum icazə verilən dəyər
                  </FormDescription>
                </FormItem>
              )}
            />

            {/* Maksimum dəyər */}
            <FormField
              control={control}
              name="validation.max"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maksimum dəyər</FormLabel>
                  <Input
                    type="number"
                    placeholder="Maksimum dəyər daxil edin"
                    {...field}
                  />
                  <FormDescription>
                    Ədəd üçün maksimum icazə verilən dəyər
                  </FormDescription>
                </FormItem>
              )}
            />
          </>
        );

      case 'text':
      case 'textarea':
      case 'password':
        return (
          <>
            {/* Minimum uzunluq */}
            <FormField
              control={control}
              name="validation.minLength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum uzunluq</FormLabel>
                  <Input
                    type="number"
                    placeholder="Minimum simvol sayı"
                    {...field}
                  />
                  <FormDescription>
                    Minimum simvol sayı tələbi
                  </FormDescription>
                </FormItem>
              )}
            />

            {/* Maksimum uzunluq */}
            <FormField
              control={control}
              name="validation.maxLength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maksimum uzunluq</FormLabel>
                  <Input
                    type="number"
                    placeholder="Maksimum simvol sayı"
                    {...field}
                  />
                  <FormDescription>
                    Maksimum simvol sayı limiti
                  </FormDescription>
                </FormItem>
              )}
            />

            {/* Dəyişən tip əsaslı əlavə validasiya seçimləri */}
            {type === 'text' && (
              <>
                {/* Regex pattern */}
                <FormField
                  control={control}
                  name="validation.pattern"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Regex pattern</FormLabel>
                      <Input
                        placeholder="Məs: ^[A-Za-z0-9]+$"
                        {...field}
                      />
                      <FormDescription>
                        Xüsusi format tələbi (regex)
                      </FormDescription>
                    </FormItem>
                  )}
                />

                {/* Validasiya tipləri - checkbox qrupu */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Format validasiyası</Label>
                  
                  {/* Email validasiyası */}
                  <FormField
                    control={control}
                    name="validation.email"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Email formatı
                          </FormLabel>
                          <FormDescription>
                            Daxil edilən mətn email formatında olmalıdır
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Phone number validasiyası */}
                  <FormField
                    control={control}
                    name="validation.tel"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Telefon formatı
                          </FormLabel>
                          <FormDescription>
                            Daxil edilən mətn telefon nömrəsi formatında olmalıdır
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* URL validasiyası */}
                  <FormField
                    control={control}
                    name="validation.url"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            URL formatı
                          </FormLabel>
                          <FormDescription>
                            Daxil edilən mətn veb ünvan formatında olmalıdır
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}
          </>
        );

      case 'date':
        return (
          <>
            {/* Minimum tarix */}
            <FormField
              control={control}
              name="validation.minDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Minimum tarix</FormLabel>
                  <DatePicker
                    value={field.value ? new Date(field.value) : undefined}
                    onChange={date => field.onChange(date ? date.toISOString() : '')}
                    placeholder="Minimum tarix seçin"
                  />
                  <FormDescription>
                    Seçilə bilən ən erkən tarix
                  </FormDescription>
                </FormItem>
              )}
            />

            {/* Maksimum tarix */}
            <FormField
              control={control}
              name="validation.maxDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Maksimum tarix</FormLabel>
                  <DatePicker
                    value={field.value ? new Date(field.value) : undefined}
                    onChange={date => field.onChange(date ? date.toISOString() : '')}
                    placeholder="Maksimum tarix seçin"
                  />
                  <FormDescription>
                    Seçilə bilən ən son tarix
                  </FormDescription>
                </FormItem>
              )}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {renderValidationFieldsForType()}
    </div>
  );
};

export default ValidationFields;
