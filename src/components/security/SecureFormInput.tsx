
import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';
import { advancedSanitize, checkSecurityRateLimit } from '@/utils/inputValidation';

interface SecureFormInputProps {
  type?: 'text' | 'email' | 'password' | 'textarea';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  maxLength?: number;
  validateOnChange?: boolean;
  securityLevel?: 'basic' | 'enhanced' | 'strict';
  allowHtml?: boolean;
}

const SecureFormInput: React.FC<SecureFormInputProps> = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  maxLength,
  validateOnChange = true,
  securityLevel = 'enhanced',
  allowHtml = false
}) => {
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [isSecure, setIsSecure] = useState(true);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    let sanitizedValue = inputValue;
    const warnings: string[] = [];

    if (validateOnChange && securityLevel !== 'basic') {
      // Rate limiting check for security-sensitive inputs
      const rateLimitKey = `input_${Date.now().toString().slice(-6)}`;
      const rateLimit = checkSecurityRateLimit(rateLimitKey, 20, 60000);
      
      if (!rateLimit.allowed) {
        warnings.push('Input rate limit exceeded. Please slow down.');
        setValidationWarnings(warnings);
        return;
      }

      // Advanced sanitization based on security level
      if (securityLevel === 'enhanced' || securityLevel === 'strict') {
        sanitizedValue = advancedSanitize(inputValue, {
          allowHtml,
          maxLength,
          stripWhitespace: securityLevel === 'strict'
        });

        // Check if sanitization changed the input
        if (sanitizedValue !== inputValue) {
          warnings.push('Input was automatically sanitized for security');
          setIsSecure(false);
        } else {
          setIsSecure(true);
        }
      }

      // Additional validation for strict mode
      if (securityLevel === 'strict') {
        // Check for potentially suspicious patterns
        const suspiciousPatterns = [
          /eval\s*\(/gi,
          /function\s*\(/gi,
          /javascript:/gi,
          /<iframe/gi,
          /<object/gi,
          /<embed/gi
        ];

        const hasSuspiciousContent = suspiciousPatterns.some(pattern => 
          pattern.test(inputValue)
        );

        if (hasSuspiciousContent) {
          warnings.push('Input contains potentially unsafe content');
          setIsSecure(false);
        }
      }
    }

    setValidationWarnings(warnings);
    onChange(sanitizedValue);
  }, [onChange, validateOnChange, securityLevel, allowHtml, maxLength]);

  const inputProps = {
    value,
    onChange: handleInputChange,
    placeholder,
    required,
    disabled,
    maxLength,
    className: `${className} ${!isSecure ? 'border-amber-500' : ''}`
  };

  return (
    <div className="space-y-2">
      {type === 'textarea' ? (
        <Textarea {...inputProps} />
      ) : (
        <Input {...inputProps} type={type} />
      )}
      
      {/* Security Status Indicator */}
      {securityLevel !== 'basic' && (
        <div className="flex items-center gap-2 text-xs">
          <Shield className={`h-3 w-3 ${isSecure ? 'text-green-500' : 'text-amber-500'}`} />
          <span className={isSecure ? 'text-green-600' : 'text-amber-600'}>
            {isSecure ? 'Secure input' : 'Input sanitized'}
          </span>
        </div>
      )}

      {/* Validation Warnings */}
      {validationWarnings.length > 0 && (
        <Alert variant="default" className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="text-xs space-y-1">
              {validationWarnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SecureFormInput;
