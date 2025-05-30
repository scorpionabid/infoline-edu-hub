
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Control } from 'react-hook-form';
import { ColumnType, ColumnTypeDefinition } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';
import { Type, Hash, Mail, Phone, Calendar, ChevronDown, CheckSquare, Circle, FileText } from 'lucide-react';

export interface ColumnTypeSelectorProps {
  control: Control<any>;
  selectedType?: ColumnType;
  onTypeChange: (type: ColumnType) => void;
}

const columnTypeDefinitions: ColumnTypeDefinition[] = [
  {
    value: 'text',
    label: 'Text',
    description: 'Single line text input',
    icon: <Type className="h-4 w-4" />
  },
  {
    value: 'textarea',
    label: 'Textarea',
    description: 'Multi-line text input',
    icon: <FileText className="h-4 w-4" />
  },
  {
    value: 'number',
    label: 'Number',
    description: 'Numeric input',
    icon: <Hash className="h-4 w-4" />
  },
  {
    value: 'email',
    label: 'Email',
    description: 'Email address input',
    icon: <Mail className="h-4 w-4" />
  },
  {
    value: 'phone',
    label: 'Phone',
    description: 'Phone number input',
    icon: <Phone className="h-4 w-4" />
  },
  {
    value: 'date',
    label: 'Date',
    description: 'Date picker input',
    icon: <Calendar className="h-4 w-4" />
  },
  {
    value: 'select',
    label: 'Select',
    description: 'Dropdown selection',
    icon: <ChevronDown className="h-4 w-4" />,
    hasOptions: true
  },
  {
    value: 'radio',
    label: 'Radio',
    description: 'Radio button selection',
    icon: <Circle className="h-4 w-4" />,
    hasOptions: true
  },
  {
    value: 'checkbox',
    label: 'Checkbox',
    description: 'Checkbox input',
    icon: <CheckSquare className="h-4 w-4" />
  }
];

const ColumnTypeSelector: React.FC<ColumnTypeSelectorProps> = ({
  control,
  selectedType,
  onTypeChange
}) => {
  const { t } = useLanguage();

  return (
    <FormField
      control={control}
      name="type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t('columnType')}</FormLabel>
          <Select 
            onValueChange={(value) => {
              field.onChange(value);
              onTypeChange(value as ColumnType);
            }} 
            defaultValue={field.value}
            value={selectedType || field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={t('selectColumnType')} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {columnTypeDefinitions.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center space-x-2">
                    <span>{type.icon}</span>
                    <span>{type.label}</span>
                    <Badge variant="outline" className="text-xs">
                      {type.value}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ColumnTypeSelector;

