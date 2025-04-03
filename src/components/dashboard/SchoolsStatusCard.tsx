
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';

interface SchoolsStatusCardProps {
  pendingSchools: number;
  approvedSchools: number;
  rejectedSchools: number;
}

const SchoolsStatusCard: React.FC<SchoolsStatusCardProps> = ({
  pendingSchools,
  approvedSchools,
  rejectedSchools
}) => {
  const { t } = useLanguage();
  
  const totalSchools = pendingSchools + approvedSchools + rejectedSchools;
  
  // Hesablamaları edək
  const pendingPercentage = totalSchools ? Math.round((pendingSchools / totalSchools) * 100) : 0;
  const approvedPercentage = totalSchools ? Math.round((approvedSchools / totalSchools) * 100) : 0;
  const rejectedPercentage = totalSchools ? Math.round((rejectedSchools / totalSchools) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('schoolsStatus')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-yellow-400 mr-2"></div>
                <span className="text-sm font-medium">{t('pending')}</span>
              </div>
              <span className="text-sm font-medium">{pendingSchools}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-yellow-400 h-2 rounded-full"
                style={{ width: `${pendingPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm font-medium">{t('approved')}</span>
              </div>
              <span className="text-sm font-medium">{approvedSchools}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${approvedPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                <span className="text-sm font-medium">{t('rejected')}</span>
              </div>
              <span className="text-sm font-medium">{rejectedSchools}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full"
                style={{ width: `${rejectedPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SchoolsStatusCard;
