
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColumnType } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';
import { TextIcon, AlignLeft, Hash, Mail, Phone, Link, Lock, Calendar, List, Circle, Square, FileIcon } from 'lucide-react';

export interface ColumnTypeSelectorProps {
  control: any;
  selectedType: ColumnType;
  onTypeChange: (type: ColumnType) => void;
}

const ColumnTypeSelector: React.FC<ColumnTypeSelectorProps> = ({ 
  control, 
  selectedType, 
  onTypeChange 
}) => {
  const { t } = useLanguage();

  const columnTypes = [
    {
      value: ColumnType.TEXT,
      label: t('text'),
      icon: TextIcon,
      description: t('singleLineText')
    },
    {
      value: ColumnType.TEXTAREA,
      label: t('textarea'),
      icon: AlignLeft,
      description: t('multiLineText')
    },
    {
      value: ColumnType.NUMBER,
      label: t('number'),
      icon: Hash,
      description: t('numericValue')
    },
    {
      value: ColumnType.EMAIL,
      label: t('email'),
      icon: Mail,
      description: t('emailAddress')
    },
    {
      value: ColumnType.PHONE,
      label: t('phone'),
      icon: Phone,
      description: t('phoneNumber')
    },
    {
      value: ColumnType.URL,
      label: t('url'),
      icon: Link,
      description: t('webAddress')
    },
    {
      value: ColumnType.PASSWORD,
      label: t('password'),
      icon: Lock,
      description: t('passwordField')
    },
    {
      value: ColumnType.DATE,
      label: t('date'),
      icon: Calendar,
      description: t('dateSelection')
    },
    {
      value: ColumnType.SELECT,
      label: t('select'),
      icon: List,
      description: t('dropdownSelection')
    },
    {
      value: ColumnType.RADIO,
      label: t('radio'),
      icon: Circle,
      description: t('radioButtons')
    },
    {
      value: ColumnType.CHECKBOX,
      label: t('checkbox'),
      icon: Square,
      description: t('checkboxes')
    },
    {
      value: ColumnType.FILE,
      label: t('file'),
      icon: FileIcon,
      description: t('fileUpload')
    }
  ];

  return (
    <FormField
      control={control}
      name="type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t('columnType')}</FormLabel>
          <FormControl>
            <Select 
              value={field.value} 
              onValueChange={(value) => {
                field.onChange(value);
                onTypeChange(value as ColumnType);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('selectColumnType')} />
              </SelectTrigger>
              <SelectContent>
                {columnTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ColumnTypeSelector;
