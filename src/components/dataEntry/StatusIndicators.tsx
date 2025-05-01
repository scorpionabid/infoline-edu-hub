
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, AlertTriangle, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ColumnValidationError } from '@/types/column';

interface StatusIndicatorProps {
  status: string;
  label: string;
  color: string;
}

export function StatusIndicator({ status, label, color }: StatusIndicatorProps) {
  const icon = () => {
    switch (status) {
      case 'approved':
        return <Check size={14} />;
      case 'pending':
        return <Clock size={14} />;
      case 'rejected':
        return <X size={14} />;
      case 'partial':
        return <AlertTriangle size={14} />;
      default:
        return null;
    }
  };
  
  return (
    <Badge variant="outline" className={`${color} flex items-center gap-1 font-normal`}>
      {icon()}
      {label}
    </Badge>
  );
}

interface ValidationMessageProps {
  error: ColumnValidationError;
}

export function ValidationMessage({ error }: ValidationMessageProps) {
  const variant = () => {
    switch (error.type) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'info':
        return 'default';
      default:
        return 'default';
    }
  };
  
  return (
    <Alert variant={variant()}>
      <AlertTitle className="flex items-center gap-1">
        {error.type === 'error' && <X size={16} />}
        {error.type === 'warning' && <AlertTriangle size={16} />}
        {error.type === 'info' && <Clock size={16} />}
        {error.id}
      </AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
    </Alert>
  );
}
