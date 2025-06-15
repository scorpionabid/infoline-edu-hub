
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { DataEntryStatus } from '@/types/dataEntry';

interface ApprovalStatusBadgeProps {
  status: DataEntryStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const ApprovalStatusBadge: React.FC<ApprovalStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true
}) => {
  const { t } = useLanguage();

  const getStatusConfig = (status: DataEntryStatus) => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          label: t('pending')
        };
      case 'approved':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          label: t('approved')
        };
      case 'rejected':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          label: t('rejected')
        };
      case 'requires_revision':
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: AlertCircle,
          label: t('requiresRevision')
        };
      case 'draft':
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Clock,
          label: t('draft')
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <Badge
      variant="outline"
      className={`${config.color} ${sizeClasses[size]} border flex items-center gap-1.5 font-medium`}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </Badge>
  );
};

export default ApprovalStatusBadge;
