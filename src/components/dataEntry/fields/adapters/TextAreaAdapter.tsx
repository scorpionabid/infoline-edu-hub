import React from 'react';
import { Textarea } from '@/components/ui/textarea';

// Sadələşdirilmiş TextArea adapteri
interface TextAreaAdapterProps {
  value: any;
  onChange: (...event: any[]) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  placeholder?: string;
  rows?: number;
}

const TextAreaAdapter: React.FC<TextAreaAdapterProps> = ({ 
  value, 
  onChange, 
  disabled = false,
  readOnly = false,
  required = false,
  placeholder = '',
  rows = 4
}) => {
  // Render həqiqi textarea komponenti
  return (
    <Textarea 
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || readOnly}
      required={required}
      placeholder={placeholder}
      readOnly={readOnly}
      rows={rows}
      className={readOnly ? 'opacity-70 cursor-not-allowed' : ''}
    />
  );
};

export default TextAreaAdapter;
