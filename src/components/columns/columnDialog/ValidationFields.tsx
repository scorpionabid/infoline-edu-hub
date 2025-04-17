
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnType } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';

export interface ValidationFieldsProps {
  form: any;
  selectedType: ColumnType;
}

const ValidationFields: React.FC<ValidationFieldsProps> = ({ form, selectedType }) => {
  const { t } = useLanguage();
  
  return (
    <div className="grid w-full gap-4">
      <h3 className="text-lg font-medium">{t('validationSettings')}</h3>
      
      {/* Number tipi üçün spesifik validasiya sahələri */}
      {selectedType === 'number' && (
        <>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="validation.minValue">{t('minValue')}</Label>
            <Input
              id="validation.minValue"
              type="number"
              placeholder={t('minValue')}
              {...form.register('validation.minValue', { valueAsNumber: true })}
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="validation.maxValue">{t('maxValue')}</Label>
            <Input
              id="validation.maxValue"
              type="number"
              placeholder={t('maxValue')}
              {...form.register('validation.maxValue', { valueAsNumber: true })}
            />
          </div>
        </>
      )}
      
      {/* Text və Textarea tiplər üçün validasiya sahələri */}
      {(selectedType === 'text' || selectedType === 'textarea') && (
        <>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="validation.minLength">{t('minLength')}</Label>
            <Input
              id="validation.minLength"
              type="number"
              placeholder={t('minLength')}
              {...form.register('validation.minLength', { valueAsNumber: true })}
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="validation.maxLength">{t('maxLength')}</Label>
            <Input
              id="validation.maxLength"
              type="number"
              placeholder={t('maxLength')}
              {...form.register('validation.maxLength', { valueAsNumber: true })}
            />
          </div>
        </>
      )}
      
      {/* Email validasiya sahəsi */}
      {selectedType === 'text' && (
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="validation.email" 
            {...form.register('validation.email')} 
          />
          <Label htmlFor="validation.email">{t('emailValidation')}</Label>
        </div>
      )}
      
      {/* Default dəyər */}
      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="default_value">{t('defaultValue')}</Label>
        <Input
          id="default_value"
          placeholder={t('defaultValue')}
          {...form.register('default_value')}
        />
      </div>
    </div>
  );
};

export default ValidationFields;
