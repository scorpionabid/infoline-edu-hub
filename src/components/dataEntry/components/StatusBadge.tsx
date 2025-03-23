
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/context/LanguageContext';
import { Check, Clock, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'approved' | 'rejected' | 'pending';
  size?: 'sm' | 'md' | 'lg'; // Müxtəlif ölçülər üçün
  withIcon?: boolean; // İkon göstərmək üçün
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md',
  withIcon = true
}) => {
  const { t } = useLanguage();
  
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0',
    md: 'text-xs px-2 py-0.5',
    lg: 'text-sm px-2.5 py-1'
  };
  
  const statusConfig = {
    approved: {
      bgClass: 'bg-green-50 text-green-700 border-green-200',
      icon: <Check className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />,
      label: t('approved')
    },
    rejected: {
      bgClass: 'bg-red-50 text-red-700 border-red-200',
      icon: <XCircle className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />,
      label: t('rejected')
    },
    pending: {
      bgClass: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: <Clock className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />,
      label: t('pending')
    }
  };
  
  const config = statusConfig[status];
  
  return (
    <Badge variant="outline" className={`${config.bgClass} ${sizeClasses[size]}`}>
      {withIcon && (
        <span className="mr-1">{config.icon}</span>
      )}
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
