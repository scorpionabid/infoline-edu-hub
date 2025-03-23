
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, Check, XCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { formatDistance } from 'date-fns';
import { az } from 'date-fns/locale';

interface CategoryHeaderProps {
  name: string;
  description?: string;
  deadline?: string;
  status?: string;
  isSubmitted?: boolean;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  name,
  description,
  deadline,
  status = 'active',
  isSubmitted = false,
}) => {
  const { t } = useLanguage();
  
  const getDeadlineStatus = (): { status: string; daysLeft: number } => {
    if (!deadline) return { status: 'none', daysLeft: 0 };
    
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { status: 'overdue', daysLeft: Math.abs(diffDays) };
    if (diffDays <= 3) return { status: 'dueSoon', daysLeft: diffDays };
    return { status: 'normal', daysLeft: diffDays };
  };
  
  const deadlineInfo = getDeadlineStatus();
  
  const renderStatusBadge = () => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            {t('pending')}
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
            <Check className="h-3 w-3 mr-1" />
            {t('approved')}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="ml-2 bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            {t('rejected')}
          </Badge>
        );
      default:
        return null;
    }
  };
  
  const renderDeadlineBadge = () => {
    if (!deadline) return null;
    
    if (deadlineInfo.status === 'overdue') {
      return (
        <Badge variant="outline" className="ml-2 bg-red-50 text-red-700 border-red-200">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {t('overdue')} ({deadlineInfo.daysLeft} {t('daysAgo')})
        </Badge>
      );
    }
    
    if (deadlineInfo.status === 'dueSoon') {
      return (
        <Badge variant="outline" className="ml-2 bg-orange-50 text-orange-700 border-orange-200">
          <Clock className="h-3 w-3 mr-1" />
          {deadlineInfo.daysLeft} {t('daysLeft')}
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
        <Clock className="h-3 w-3 mr-1" />
        {formatDistance(new Date(deadline), new Date(), { addSuffix: true, locale: az })}
      </Badge>
    );
  };
  
  return (
    <Card className="mb-4 bg-muted/20">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center">
              {name}
              {renderStatusBadge()}
            </h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div>
            {deadline && (
              <div className="text-sm text-muted-foreground flex items-center">
                {t('deadline')}: {new Date(deadline).toLocaleDateString()}
                {renderDeadlineBadge()}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryHeader;
