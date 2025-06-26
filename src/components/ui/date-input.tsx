
import React from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import { Input } from './input';
import { Calendar } from 'lucide-react';

interface DateInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  placeholder,
  // className
}) => {
  const { t } = useTranslation();

  return (
    <div className="relative">
      <Input
        type="date"
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder || t('ui.select_date')}
        className={className}
      />
      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
    </div>
  );
};

export default DateInput;
