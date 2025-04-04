
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface FormStatusSectionProps {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  overdueCount: number;
  dueSoonCount: number;
  onNavigate: (status: string | null) => void;
}

const FormStatusSection: React.FC<FormStatusSectionProps> = ({ 
  pendingCount,
  approvedCount,
  rejectedCount,
  overdueCount,
  dueSoonCount,
  onNavigate
}) => {
  const { t } = useLanguage();
  
  const totalCount = pendingCount + approvedCount + rejectedCount + overdueCount + dueSoonCount || 1;
  
  // Calculate percentages
  const pendingPercentage = Math.round((pendingCount / totalCount) * 100);
  const approvedPercentage = Math.round((approvedCount / totalCount) * 100);
  const rejectedPercentage = Math.round((rejectedCount / totalCount) * 100);
  const overduePercentage = Math.round((overdueCount / totalCount) * 100);
  const dueSoonPercentage = Math.round((dueSoonCount / totalCount) * 100);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('formStatus')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Pending Forms */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-amber-500 mr-2" />
                <span className="text-sm font-medium">{t('pending')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {pendingCount} <span className="text-muted-foreground text-xs">({pendingPercentage}%)</span>
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 text-xs"
                  onClick={() => onNavigate('pending')}
                >
                  {t('view')}
                </Button>
              </div>
            </div>
            <Progress value={pendingPercentage} className="h-2" />
          </div>
          
          {/* Approved Forms */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm font-medium">{t('approved')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {approvedCount} <span className="text-muted-foreground text-xs">({approvedPercentage}%)</span>
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 text-xs"
                  onClick={() => onNavigate('approved')}
                >
                  {t('view')}
                </Button>
              </div>
            </div>
            <Progress value={approvedPercentage} className="h-2 bg-green-100" />
          </div>
          
          {/* Rejected Forms */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <XCircle className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-sm font-medium">{t('rejected')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {rejectedCount} <span className="text-muted-foreground text-xs">({rejectedPercentage}%)</span>
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 text-xs"
                  onClick={() => onNavigate('rejected')}
                >
                  {t('view')}
                </Button>
              </div>
            </div>
            <Progress value={rejectedPercentage} className="h-2 bg-red-100" />
          </div>
          
          {/* Overdue Forms */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-sm font-medium">{t('overdue')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {overdueCount} <span className="text-muted-foreground text-xs">({overduePercentage}%)</span>
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 text-xs"
                  onClick={() => onNavigate('overdue')}
                >
                  {t('view')}
                </Button>
              </div>
            </div>
            <Progress value={overduePercentage} className="h-2 bg-red-100" />
          </div>
          
          {/* Due Soon Forms */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-sm font-medium">{t('dueSoon')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {dueSoonCount} <span className="text-muted-foreground text-xs">({dueSoonPercentage}%)</span>
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 text-xs"
                  onClick={() => onNavigate('dueSoon')}
                >
                  {t('view')}
                </Button>
              </div>
            </div>
            <Progress value={dueSoonPercentage} className="h-2 bg-blue-100" />
          </div>
          
          <div className="pt-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => onNavigate(null)}
            >
              {t('viewAllForms')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FormStatusSection;
