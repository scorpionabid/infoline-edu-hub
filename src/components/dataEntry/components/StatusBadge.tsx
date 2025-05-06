
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Clock, CheckCircle, AlertTriangle, FilePlus, Calendar } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export interface StatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected' | 'draft' | 'submitted' | 'expired' | 'upcoming' | string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  className,
  size = 'md' 
}) => {
  const { t } = useLanguage();
  
  // Size ilə bağlı siniflər
  const sizeClasses = {
    sm: "text-xs py-0 px-1",
    md: "text-xs py-0.5 px-2",
    lg: "text-sm py-1 px-3"
  };
  
  // İkon ölçüləri
  const iconSizes = {
    sm: "h-2 w-2 mr-0.5",
    md: "h-3 w-3 mr-1",
    lg: "h-4 w-4 mr-1.5"
  };
  
  const statusConfig: Record<string, { 
    icon: React.ReactNode, 
    className: string,
    label: string 
  }> = {
    pending: {
      icon: <Clock className={iconSizes[size]} />,
      className: "bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200",
      label: t('pending')
    },
    approved: {
      icon: <CheckCircle className={iconSizes[size]} />,
      className: "bg-green-50 text-green-600 hover:bg-green-100 border-green-200",
      label: t('approved')
    },
    rejected: {
      icon: <AlertTriangle className={iconSizes[size]} />,
      className: "bg-red-50 text-red-600 hover:bg-red-100 border-red-200",
      label: t('rejected')
    },
    draft: {
      icon: <FilePlus className={iconSizes[size]} />,
      className: "bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200",
      label: t('draft')
    },
    submitted: {
      icon: <CheckCircle className={iconSizes[size]} />,
      className: "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200",
      label: t('submitted')
    },
    expired: {
      icon: <Calendar className={iconSizes[size]} />,
      className: "bg-red-50 text-red-600 hover:bg-red-100 border-red-200",
      label: t('expired')
    },
    upcoming: {
      icon: <Calendar className={iconSizes[size]} />,
      className: "bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200",
      label: t('upcoming')
    }
  };
  
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge 
      variant="outline" 
      className={cn(config.className, sizeClasses[size], className)}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
};
