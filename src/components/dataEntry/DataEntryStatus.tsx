
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useLanguageSafe } from '@/context/LanguageContext';
import { CheckCircle, Clock, XCircle, AlertTriangle, FileText, HelpCircle } from 'lucide-react';

interface DataEntryStatusProps {
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'not_started' | 'in_progress';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const DataEntryStatus: React.FC<DataEntryStatusProps> = ({ 
  status, 
  size = 'md',
  showIcon = true 
}) => {
  const { t } = useLanguageSafe();
  
  const getStatusConfig = () => {
    switch (status) {
      case 'draft':
        return {
          label: t('draft'),
          variant: 'outline',
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <FileText className="h-3 w-3 mr-1" />
        };
      case 'pending':
        return {
          label: t('pending'),
          variant: 'outline',
          className: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: <Clock className="h-3 w-3 mr-1" />
        };
      case 'approved':
        return {
          label: t('approved'),
          variant: 'outline',
          className: 'bg-green-100 text-green-800 border-green-200',
          icon: <CheckCircle className="h-3 w-3 mr-1" />
        };
      case 'rejected':
        return {
          label: t('rejected'),
          variant: 'outline',
          className: 'bg-red-100 text-red-800 border-red-200',
          icon: <XCircle className="h-3 w-3 mr-1" />
        };
      case 'not_started':
        return {
          label: t('notStarted'),
          variant: 'outline', 
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <HelpCircle className="h-3 w-3 mr-1" />
        };
      case 'in_progress':
        return {
          label: t('inProgress'),
          variant: 'outline',
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <AlertTriangle className="h-3 w-3 mr-1" />
        };
      default:
        return {
          label: status,
          variant: 'outline',
          className: '',
          icon: <HelpCircle className="h-3 w-3 mr-1" />
        };
    }
  };
  
  const config = getStatusConfig();
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base'
  };
  
  return (
    <Badge 
      variant="outline" 
      className={`${config.className} ${sizeClasses[size]} flex items-center`}
    >
      {showIcon && config.icon}
      {config.label}
    </Badge>
  );
};

export default DataEntryStatus;
