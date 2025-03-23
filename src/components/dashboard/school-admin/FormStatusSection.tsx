
import React from 'react';
import { useLanguageSafe } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Check, Clock, XCircle, AlertTriangle, AlertCircle, FileText } from 'lucide-react';

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
  const { t } = useLanguageSafe();
  
  const totalForms = forms.pending + forms.approved + forms.rejected + forms.dueSoon + forms.overdue;
  
  // Minimalist versiya əlavə edildi
  const statusCards = [
    {
      id: null,
      name: t('allForms'),
      count: totalForms,
      icon: <FileText size={16} />,
      color: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      activeColor: 'bg-gray-700 text-white',
    },
    {
      id: 'pending',
      name: t('pendingForms'),
      count: forms.pending,
      icon: <Clock size={16} />,
      color: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
      activeColor: 'bg-amber-600 text-white',
    },
    {
      id: 'approved',
      name: t('approvedForms'),
      count: forms.approved,
      icon: <Check size={16} />,
      color: 'bg-green-100 text-green-800 hover:bg-green-200',
      activeColor: 'bg-green-600 text-white',
    },
    {
      id: 'rejected',
      name: t('rejectedForms'),
      count: forms.rejected,
      icon: <XCircle size={16} />,
      color: 'bg-red-100 text-red-800 hover:bg-red-200',
      activeColor: 'bg-red-600 text-white',
    },
    {
      id: 'dueSoon',
      name: t('dueSoonForms'),
      count: forms.dueSoon,
      icon: <AlertTriangle size={16} />,
      color: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      activeColor: 'bg-blue-600 text-white',
    },
    {
      id: 'overdue',
      name: t('overdueForms'),
      count: forms.overdue,
      icon: <AlertCircle size={16} />,
      color: 'bg-rose-100 text-rose-800 hover:bg-rose-200',
      activeColor: 'bg-rose-600 text-white',
    }
  ];
  
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {statusCards.map((status) => (
          <button 
            key={status.id || 'all'} 
            className={cn(
              "py-1 px-3 rounded-full flex items-center gap-1 text-sm",
              activeStatus === status.id ? status.activeColor : status.color,
              "transition-colors duration-200"
            )}
            onClick={() => navigateToDataEntry(status.id)}
          >
            {status.icon}
            <span>{status.name}</span>
            <span className="font-bold ml-1">{status.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FormStatusSection;
