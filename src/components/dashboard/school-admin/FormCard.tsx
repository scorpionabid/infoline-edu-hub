
import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { FormStatus } from '@/types/form';

interface FormCardProps {
  id: string;
  title: string;
  category: string;
  status: FormStatus;
  completionPercentage: number;
  deadline?: string;
  onClick: () => void;
}

const FormCard: React.FC<FormCardProps> = ({ 
  id, 
  title, 
  category, 
  status, 
  completionPercentage, 
  deadline,
  onClick 
}) => {
  const statusConfig = {
    pending: { 
      label: 'Gözləmədə', 
      icon: <Clock className="h-4 w-4" />, 
      variant: 'bg-amber-50 text-amber-700 border-amber-200' 
    },
    approved: { 
      label: 'Təsdiqlənib', 
      icon: <CheckCircle2 className="h-4 w-4" />, 
      variant: 'bg-green-50 text-green-700 border-green-200' 
    },
    rejected: { 
      label: 'Rədd edilib', 
      icon: <XCircle className="h-4 w-4" />, 
      variant: 'bg-red-50 text-red-700 border-red-200' 
    },
    empty: { 
      label: 'Boş', 
      icon: <AlertCircle className="h-4 w-4" />, 
      variant: 'bg-slate-50 text-slate-700 border-slate-200' 
    },
    due: { 
      label: 'Vaxtı yaxınlaşır', 
      icon: <AlertCircle className="h-4 w-4" />, 
      variant: 'bg-blue-50 text-blue-700 border-blue-200' 
    },
    overdue: { 
      label: 'Vaxtı keçib', 
      icon: <AlertCircle className="h-4 w-4" />, 
      variant: 'bg-rose-50 text-rose-700 border-rose-200' 
    },
    draft: { 
      label: 'Qaralama', 
      icon: <AlertCircle className="h-4 w-4" />, 
      variant: 'bg-slate-50 text-slate-700 border-slate-200' 
    }
  };

  const isOverdue = deadline && new Date(deadline) < new Date();

  return (
    <Card className="w-full overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base line-clamp-1">{title}</CardTitle>
          <Badge variant="outline" className={cn(statusConfig[status].variant)}>
            <span className="flex items-center gap-1">
              {statusConfig[status].icon}
              {statusConfig[status].label}
            </span>
          </Badge>
        </div>
        <CardDescription className="line-clamp-1">{category}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full", 
              completionPercentage === 100 
                ? "bg-green-500" 
                : completionPercentage > 0 
                  ? "bg-amber-500" 
                  : "bg-slate-300"
            )}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span>{completionPercentage}% tamamlanıb</span>
          {deadline && (
            <span className={cn("flex items-center gap-1", isOverdue ? "text-red-600" : "text-slate-600")}>
              <Calendar className="h-3 w-3" />
              {isOverdue ? 'Gecikmiş' : new Date(deadline).toLocaleDateString('az-AZ')}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="ghost" size="sm" className="w-full h-8 justify-between p-2">
          <span>Məlumat daxil et</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FormCard;
