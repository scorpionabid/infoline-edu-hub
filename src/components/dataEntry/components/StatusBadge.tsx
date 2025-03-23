
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/context/LanguageContext';

interface StatusBadgeProps {
  status: 'approved' | 'rejected' | 'pending';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { t } = useLanguage();
  
  if (status === 'approved') {
    return (
      <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200 text-xs px-1.5 py-0">
        {t('approved')}
      </Badge>
    );
  }
  
  if (status === 'rejected') {
    return (
      <Badge variant="outline" className="ml-2 bg-red-50 text-red-700 border-red-200 text-xs px-1.5 py-0">
        {t('rejected')}
      </Badge>
    );
  }
  
  return null;
};

export default StatusBadge;
