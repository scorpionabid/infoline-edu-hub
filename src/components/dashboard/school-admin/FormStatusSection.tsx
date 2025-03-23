
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { File, Clock, CheckCircle, XCircle, AlertTriangle, AlertCircle } from 'lucide-react';

interface FormStatisticsProps {
  pending: number;
  approved: number;
  rejected: number;
  dueSoon: number;
  overdue: number;
}

interface FormStatusSectionProps {
  forms: FormStatisticsProps;
  navigateToDataEntry: (status: string | null) => void;
  activeStatus?: string | null;
  compact?: boolean;
}

const FormStatusSection: React.FC<FormStatusSectionProps> = ({ 
  forms, 
  navigateToDataEntry,
  activeStatus = null,
  compact = false
}) => {
  const { t } = useLanguage();
  
  const totalForms = forms.pending + forms.approved + forms.rejected + forms.dueSoon + forms.overdue;
  
  const statusCards = [
    {
      id: null,
      name: t('allForms'),
      count: totalForms,
      icon: <File />,
      color: 'bg-gray-900 text-gray-50 hover:bg-gray-800',
      activeColor: 'bg-gray-900 text-gray-50',
      activeClass: 'ring-4 ring-gray-300'
    },
    {
      id: 'pending',
      name: t('pendingForms'),
      count: forms.pending,
      icon: <Clock />,
      color: 'bg-amber-800 text-amber-50 hover:bg-amber-700',
      activeColor: 'bg-amber-800 text-amber-50',
      activeClass: 'ring-4 ring-amber-200'
    },
    {
      id: 'approved',
      name: t('approvedForms'),
      count: forms.approved,
      icon: <CheckCircle />,
      color: 'bg-green-800 text-green-50 hover:bg-green-700',
      activeColor: 'bg-green-800 text-green-50',
      activeClass: 'ring-4 ring-green-200'
    },
    {
      id: 'rejected',
      name: t('rejectedForms'),
      count: forms.rejected,
      icon: <XCircle />,
      color: 'bg-red-800 text-red-50 hover:bg-red-700',
      activeColor: 'bg-red-800 text-red-50',
      activeClass: 'ring-4 ring-red-200'
    },
    {
      id: 'dueSoon',
      name: t('dueSoonForms'),
      count: forms.dueSoon,
      icon: <AlertTriangle />,
      color: 'bg-blue-800 text-blue-50 hover:bg-blue-700',
      activeColor: 'bg-blue-800 text-blue-50',
      activeClass: 'ring-4 ring-blue-200'
    },
    {
      id: 'overdue',
      name: t('overdueForms'),
      count: forms.overdue,
      icon: <AlertCircle />,
      color: 'bg-rose-800 text-rose-50 hover:bg-rose-700',
      activeColor: 'bg-rose-800 text-rose-50',
      activeClass: 'ring-4 ring-rose-200'
    }
  ];
  
  const getCardClasses = (status: { id: string | null, activeClass: string, color: string, activeColor: string }) => {
    const isActive = activeStatus === status.id;
    
    return cn(
      'transition-all duration-200',
      isActive ? status.activeColor : status.color,
      isActive ? status.activeClass : '',
      'shadow hover:shadow-md cursor-pointer'
    );
  };
  
  return (
    <div className="space-y-3">
      <h3 className={cn("font-medium", compact ? "" : "text-lg")}>
        {t('formStatus')}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {statusCards.map((status) => (
          <Card 
            key={status.id || 'all'} 
            className={getCardClasses(status)}
            onClick={() => navigateToDataEntry(status.id)}
          >
            <div className="p-3 flex flex-col items-center justify-center text-center space-y-1">
              <div className="text-4xl font-bold">{status.count}</div>
              <div className="flex items-center gap-1">
                {status.icon}
                <div className={compact ? "text-xs" : "text-sm"}>{status.name}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FormStatusSection;
