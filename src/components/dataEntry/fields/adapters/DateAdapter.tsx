import React from 'react';
import { Input } from '@/components/ui/input';

interface DateAdapterProps {
  value: any;
  onChange: (...event: any[]) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  dateType?: 'date' | 'time' | 'datetime-local'; // Default HTML input types
}

const DateAdapter: React.FC<DateAdapterProps> = ({ 
  value, 
  onChange, 
  disabled = false,
  readOnly = false,
  required = false,
  dateType = 'date'
}) => {
  // Ensure valid value is passed to the date input
  const safeValue = value || '';
  
  return (
    <Input 
      type={dateType}
      value={safeValue}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || readOnly}
      required={required}
      readOnly={readOnly}
      className={readOnly ? 'opacity-70 cursor-not-allowed' : ''}
    />
  );
};

export default DateAdapter;
