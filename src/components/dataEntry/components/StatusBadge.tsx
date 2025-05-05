
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';

interface StatusBadgeProps {
  status: 'draft' | 'approved' | 'rejected' | 'pending' | 'active' | 'inactive' | 'due' | 'overdue';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { t } = useLanguage();
  
  // Status görə badge stili seçirik
  let badgeStyle = 'bg-gray-100 text-gray-800 hover:bg-gray-200'; // default
  
  switch (status) {
    case 'approved':
      badgeStyle = 'bg-green-100 text-green-800 hover:bg-green-200';
      break;
    case 'active':
      badgeStyle = 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      break;
    case 'rejected':
      badgeStyle = 'bg-red-100 text-red-800 hover:bg-red-200';
      break;
    case 'pending':
      badgeStyle = 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      break;
    case 'draft':
      badgeStyle = 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      break;
    case 'inactive':
      badgeStyle = 'bg-gray-100 text-gray-500 hover:bg-gray-200';
      break;
    case 'due':
      badgeStyle = 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      break;
    case 'overdue':
      badgeStyle = 'bg-rose-100 text-rose-800 hover:bg-rose-200';
      break;
  }
  
  return (
    <Badge variant="outline" className={badgeStyle}>
      {t(status.toLowerCase())}
    </Badge>
  );
};

export default StatusBadge;
