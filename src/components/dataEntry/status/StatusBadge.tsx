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
  
  // Status konfiqurasiyaları
  const statusConfig = {
    approved: {
      className: "bg-success/20 text-success border-success/40 hover:bg-success/30",
      label: t('approved'),
      icon: <CheckCircle className={iconSizes[size]} />
    },
    pending: {
      className: "bg-muted text-muted-foreground border-muted-foreground/40 hover:bg-muted/80",
      label: t('pending'),
      icon: <Clock className={iconSizes[size]} />
    },
    rejected: {
      className: "bg-destructive/20 text-destructive border-destructive/40 hover:bg-destructive/30",
      label: t('rejected'),
      icon: <AlertTriangle className={iconSizes[size]} />
    },
    draft: {
      className: "bg-secondary/50 text-secondary-foreground border-secondary/40 hover:bg-secondary/70",
      label: t('draft'),
      icon: <FilePlus className={iconSizes[size]} />
    },
    submitted: {
      className: "bg-primary/20 text-primary border-primary/40 hover:bg-primary/30",
      label: t('submitted'),
      icon: <CheckCircle className={iconSizes[size]} />
    },
    expired: {
      className: "bg-destructive/20 text-destructive border-destructive/40 hover:bg-destructive/30",
      label: t('expired'),
      icon: <AlertTriangle className={iconSizes[size]} />
    },
    upcoming: {
      className: "bg-info/20 text-info border-info/40 hover:bg-info/30",
      label: t('upcoming'),
      icon: <Calendar className={iconSizes[size]} />
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

export default StatusBadge;
