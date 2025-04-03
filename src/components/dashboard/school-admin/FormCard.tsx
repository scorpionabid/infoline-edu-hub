
import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { FormStatus } from '@/types/form';

interface FormCardProps {
  id: string;
  title: string;
  category?: string;
  status: FormStatus;
  completionPercentage: number;
  deadline?: string; // string tipində deadline
  onClick?: () => void;
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
  const { t } = useLanguage();
  
  // Tarix formatını formatlaşdırmaq
  const formatDeadline = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Statusu badge rəngini müəyyən etmək
  const getBadgeVariant = () => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'destructive';
      case 'overdue': return 'destructive';
      case 'dueSoon': return 'warning';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };
  
  // Statusun ikonunu müəyyən etmək
  const getStatusIcon = () => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'rejected': return <XCircle className="h-3 w-3 mr-1" />;
      case 'overdue': return <AlertCircle className="h-3 w-3 mr-1" />;
      case 'dueSoon': return <Clock className="h-3 w-3 mr-1" />;
      case 'pending': return <Clock className="h-3 w-3 mr-1" />;
      default: return null;
    }
  };

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer" 
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <h3 className="font-semibold text-lg mb-1 truncate">{title}</h3>
        {category && (
          <p className="text-sm text-muted-foreground mb-3">{category}</p>
        )}
        
        <div className="flex flex-col space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">{t('completion')}</span>
            <span className="text-xs font-medium">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 flex justify-between items-center">
        <Badge variant={getBadgeVariant()} className="flex gap-1 items-center">
          {getStatusIcon()}
          {t(status.toLowerCase())}
        </Badge>
        
        {deadline && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            {formatDeadline(deadline)}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default FormCard;
