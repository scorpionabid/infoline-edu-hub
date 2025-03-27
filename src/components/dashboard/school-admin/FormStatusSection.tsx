
import React from 'react';
import { 
  Card, 
  CardContent, 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

interface FormStatusProps {
  forms: {
    pending: number;
    approved: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
  };
  navigateToDataEntry: (status: string | null) => void;
  activeStatus: string | null;
  compact?: boolean;
}

const FormStatusSection: React.FC<FormStatusProps> = ({ 
  forms, 
  navigateToDataEntry, 
  activeStatus,
  compact = false 
}) => {
  const { t } = useLanguage();
  
  // Əmin olaq ki, forms obyekti mövcuddur və bütün lazımi xassələrə malikdir
  const safeForm = {
    pending: forms?.pending || 0,
    approved: forms?.approved || 0,
    rejected: forms?.rejected || 0,
    dueSoon: forms?.dueSoon || 0,
    overdue: forms?.overdue || 0
  };
  
  const statuses = [
    {
      key: 'pending',
      label: t('pending'),
      value: safeForm.pending,
      icon: <Clock className="h-5 w-5" />,
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      hoverColor: 'hover:bg-amber-200'
    },
    {
      key: 'approved',
      label: t('approved'),
      value: safeForm.approved,
      icon: <Check className="h-5 w-5" />,
      color: 'bg-green-100 text-green-800 border-green-200',
      hoverColor: 'hover:bg-green-200'
    },
    {
      key: 'rejected',
      label: t('rejected'),
      value: safeForm.rejected,
      icon: <XCircle className="h-5 w-5" />,
      color: 'bg-red-100 text-red-800 border-red-200',
      hoverColor: 'hover:bg-red-200'
    },
    {
      key: 'dueSoon',
      label: t('dueSoon'),
      value: safeForm.dueSoon,
      icon: <Clock className="h-5 w-5" />,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      hoverColor: 'hover:bg-blue-200'
    },
    {
      key: 'overdue',
      label: t('overdue'),
      value: safeForm.overdue,
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'bg-red-100 text-red-800 border-red-200',
      hoverColor: 'hover:bg-red-200'
    }
  ];
  
  return (
    <div className={cn("grid gap-4", 
      compact ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-5" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
    )}>
      {statuses.map((status) => (
        <Card 
          key={status.key}
          className={cn(
            "border", 
            activeStatus === status.key ? "border-primary" : "border-border",
            compact ? "p-2" : ""
          )}
        >
          <CardContent className={cn(
            "flex items-center justify-between p-4", 
            compact ? "p-2" : ""
          )}>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className={cn("p-1.5 rounded-full", status.color)}>
                  {status.icon}
                </div>
                <span className={cn(
                  "font-medium", 
                  compact ? "text-sm" : ""
                )}>
                  {status.label}
                </span>
              </div>
              <span className={cn(
                "text-2xl font-bold mt-2",
                compact ? "text-xl" : ""
              )}>
                {status.value}
              </span>
            </div>
            <Button
              variant="ghost"
              size={compact ? "sm" : "default"}
              className={cn(
                "rounded-full", 
                status.hoverColor
              )}
              onClick={() => navigateToDataEntry(status.key)}
            >
              {t('view')}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FormStatusSection;
