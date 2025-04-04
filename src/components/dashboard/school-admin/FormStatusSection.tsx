
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  AlertCircle, 
  FileInput 
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

interface FormStatusCounts {
  pending: number;
  approved: number;
  rejected: number;
  dueSoon: number;
  overdue: number;
}

interface FormStatusSectionProps {
  forms: FormStatusCounts;
  navigateToDataEntry: (status: string | null) => void;
  activeStatus: string | null;
  compact?: boolean;
}

const FormStatusSection: React.FC<FormStatusSectionProps> = ({
  forms,
  navigateToDataEntry,
  activeStatus,
  compact = false
}) => {
  const { t } = useLanguage();
  
  const statusItems = [
    {
      id: 'pending',
      label: t('pending'),
      count: forms.pending,
      icon: <Clock className="h-4 w-4" />,
      color: 'bg-yellow-100 text-yellow-700'
    },
    {
      id: 'approved',
      label: t('approved'),
      count: forms.approved,
      icon: <CheckCircle2 className="h-4 w-4" />,
      color: 'bg-green-100 text-green-700'
    },
    {
      id: 'rejected',
      label: t('rejected'),
      count: forms.rejected,
      icon: <XCircle className="h-4 w-4" />,
      color: 'bg-red-100 text-red-700'
    },
    {
      id: 'dueSoon',
      label: t('dueSoon'),
      count: forms.dueSoon,
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'bg-orange-100 text-orange-700'
    },
    {
      id: 'overdue',
      label: t('overdue'),
      count: forms.overdue,
      icon: <AlertCircle className="h-4 w-4" />,
      color: 'bg-red-100 text-red-700'
    }
  ];
  
  return (
    <Card>
      <CardContent className={cn("flex flex-wrap gap-2", compact ? "py-3" : "py-6")}>
        {compact && (
          <Button
            variant={activeStatus === null ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-1"
            onClick={() => navigateToDataEntry(null)}
          >
            <FileInput className="h-4 w-4" />
            {t('all')}
          </Button>
        )}
        
        {statusItems.map(item => (
          <Button
            key={item.id}
            variant={activeStatus === item.id ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-1"
            onClick={() => navigateToDataEntry(item.id)}
            disabled={item.count === 0}
          >
            <span className={cn("flex items-center gap-1 px-1 py-0.5 rounded", item.color)}>
              {item.icon}
              <span>{item.count}</span>
            </span>
            <span>{item.label}</span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default FormStatusSection;
