
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/context/LanguageContext';
import { Check, Clock, XCircle, AlertTriangle, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'approved' | 'rejected' | 'pending' | 'due' | 'overdue' | 'draft';
  size?: 'sm' | 'md' | 'lg'; // Müxtəlif ölçülər üçün
  withIcon?: boolean; // İkon göstərmək üçün
  withBorder?: boolean; // Kənar xətt əlavə etmək
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md',
  withIcon = true,
  withBorder = true
}) => {
  const { t } = useLanguage();
  
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0',
    md: 'text-xs px-2 py-0.5',
    lg: 'text-sm px-2.5 py-1'
  };
  
  const statusConfig = {
    approved: {
      bgClass: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
      icon: <Check className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />,
      label: t('approved')
    },
    rejected: {
      bgClass: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
      icon: <XCircle className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />,
      label: t('rejected')
    },
    pending: {
      bgClass: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
      icon: <Clock className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />,
      label: t('pending')
    },
    due: {
      bgClass: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
      icon: <AlertTriangle className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />,
      label: t('dueSoon')
    },
    overdue: {
      bgClass: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
      icon: <AlertCircle className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />,
      label: t('overdue')
    },
    draft: {
      bgClass: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100',
      icon: <Clock className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />,
      label: t('draft')
    }
  };
  
  const config = statusConfig[status];
  const borderClass = withBorder ? '' : 'border-transparent';
  
  return (
    <Badge variant="outline" className={`${config.bgClass} ${sizeClasses[size]} ${borderClass}`}>
      {withIcon && (
        <span className="mr-1">{config.icon}</span>
      )}
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
