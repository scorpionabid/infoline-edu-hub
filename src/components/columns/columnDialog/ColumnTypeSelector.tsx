
import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Type, 
  AlignLeft, 
  BarChart, 
  CalendarDays, 
  ChevronsUpDown, 
  CheckSquare, 
  Circle, 
  FileUp, 
  Image, 
  Mail, 
  Link, 
  Phone, 
  Sliders, 
  Palette, 
  Lock, 
  Clock, 
  Edit,
  HelpCircle
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { ColumnType } from '@/types/column';

export interface ColumnTypeSelectorProps {
  value?: ColumnType;
  onChange: (value: ColumnType) => void;
  disabled?: boolean;
}

const ColumnTypeSelector: React.FC<ColumnTypeSelectorProps> = ({ 
  value, 
  onChange,
  disabled = false 
}) => {
  const { t } = useLanguage();

  const columnTypes = [
    {
      value: 'text' as ColumnType,
      label: t('text'),
      description: t('textDescription'),
      icon: <Type className="mr-2 h-4 w-4" />
    },
    {
      value: 'textarea' as ColumnType,
      label: t('textarea'),
      description: t('textareaDescription'),
      icon: <AlignLeft className="mr-2 h-4 w-4" />
    },
    {
      value: 'number' as ColumnType,
      label: t('number'),
      description: t('numberDescription'),
      icon: <BarChart className="mr-2 h-4 w-4" />
    },
    {
      value: 'date' as ColumnType,
      label: t('date'),
      description: t('dateDescription'),
      icon: <CalendarDays className="mr-2 h-4 w-4" />
    },
    {
      value: 'select' as ColumnType,
      label: t('select'),
      description: t('selectDescription'),
      icon: <ChevronsUpDown className="mr-2 h-4 w-4" />
    },
    {
      value: 'checkbox' as ColumnType,
      label: t('checkbox'),
      description: t('checkboxDescription'),
      icon: <CheckSquare className="mr-2 h-4 w-4" />
    },
    {
      value: 'radio' as ColumnType,
      label: t('radio'),
      description: t('radioDescription'),
      icon: <Circle className="mr-2 h-4 w-4" />
    },
    {
      value: 'file' as ColumnType,
      label: t('file'),
      description: t('fileDescription'),
      icon: <FileUp className="mr-2 h-4 w-4" />
    },
    {
      value: 'image' as ColumnType,
      label: t('image'),
      description: t('imageDescription'),
      icon: <Image className="mr-2 h-4 w-4" />
    },
    {
      value: 'email' as ColumnType,
      label: t('email'),
      description: t('emailDescription'),
      icon: <Mail className="mr-2 h-4 w-4" />
    },
    {
      value: 'url' as ColumnType,
      label: t('url'),
      description: t('urlDescription'),
      icon: <Link className="mr-2 h-4 w-4" />
    },
    {
      value: 'phone' as ColumnType,
      label: t('phone'),
      description: t('phoneDescription'),
      icon: <Phone className="mr-2 h-4 w-4" />
    },
    {
      value: 'range' as ColumnType,
      label: t('range'),
      description: t('rangeDescription'),
      icon: <Sliders className="mr-2 h-4 w-4" />
    },
    {
      value: 'color' as ColumnType,
      label: t('color'),
      description: t('colorDescription'),
      icon: <Palette className="mr-2 h-4 w-4" />
    },
    {
      value: 'password' as ColumnType,
      label: t('password'),
      description: t('passwordDescription'),
      icon: <Lock className="mr-2 h-4 w-4" />
    },
    {
      value: 'time' as ColumnType,
      label: t('time'),
      description: t('timeDescription'),
      icon: <Clock className="mr-2 h-4 w-4" />
    }
  ];

  return (
    <RadioGroup 
      value={value} 
      onValueChange={(val) => onChange(val as ColumnType)}
      className="grid grid-cols-2 gap-2"
      disabled={disabled}
    >
      {columnTypes.map((type) => (
        <div key={type.value} className="flex items-center">
          <RadioGroupItem 
            value={type.value} 
            id={`type-${type.value}`} 
            className="peer sr-only"
            disabled={disabled}
          />
          <Label
            htmlFor={`type-${type.value}`}
            className={`
              flex items-center space-x-2 rounded-md border-2 border-muted p-2
              hover:bg-muted hover:text-accent-foreground
              peer-data-[state=checked]:border-primary
              peer-data-[state=checked]:text-primary
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {type.icon}
            <div className="text-sm">{type.label}</div>
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
};

export default ColumnTypeSelector;
