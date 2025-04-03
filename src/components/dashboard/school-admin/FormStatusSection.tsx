
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { 
  ClipboardList, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';

interface FormStatusSectionProps {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  overdueCount: number;
  dueSoonCount: number;
  onNavigate: (status?: string | null) => void;
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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          {t('formStatus')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 rounded-lg border bg-background/50">
            <div className="flex items-center">
              <div className="p-2 bg-amber-100 rounded-full text-amber-600 mr-3">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">{t('pendingForms')}</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onNavigate("pending")}
              className="text-xs"
            >
              {t('view')}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border bg-background/50">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-full text-green-600 mr-3">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">{t('approvedForms')}</p>
                <p className="text-2xl font-bold">{approvedCount}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onNavigate("approved")}
              className="text-xs"
            >
              {t('view')}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border bg-background/50">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-full text-red-600 mr-3">
                <XCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">{t('rejectedForms')}</p>
                <p className="text-2xl font-bold">{rejectedCount}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onNavigate("rejected")}
              className="text-xs"
            >
              {t('view')}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border bg-background/50">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-full text-blue-600 mr-3">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">{t('dueSoonOverdue')}</p>
                <p className="text-2xl font-bold">{dueSoonCount + overdueCount}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onNavigate("dueSoon")}
              className="text-xs"
            >
              {t('view')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FormStatusSection;
