
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { SchoolStat } from '@/types/school';

export interface SchoolStatsCardProps {
  stats: SchoolStat[];
}

const SchoolStatsCard: React.FC<SchoolStatsCardProps> = ({ stats }) => {
  const { t } = useLanguage();
  
  // Məktəb statistikalarını hesabla
  const activeSchools = stats.filter(s => s.status === 'active').length;
  const totalCompletionRate = stats.length > 0 
    ? stats.reduce((sum, s) => sum + s.completionRate, 0) / stats.length 
    : 0;
    
  const pendingForms = stats.reduce((sum, s) => sum + (s.pendingForms || 0), 0);
  const completedForms = stats.reduce((sum, s) => sum + (s.formsCompleted || 0), 0);
  const totalForms = stats.reduce((sum, s) => sum + (s.totalForms || 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('schoolStats')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('totalSchools')}
              </p>
              <p className="text-2xl font-bold">{stats.length}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('activeSchools')}
              </p>
              <p className="text-2xl font-bold">{activeSchools}</p>
            </div>
          </div>
          
          <div className="pt-2">
            <p className="text-sm font-medium text-muted-foreground">
              {t('avgCompletionRate')}
            </p>
            <p className="text-2xl font-bold">{Math.round(totalCompletionRate)}%</p>
          </div>
          
          <div className="pt-2">
            <p className="text-sm font-medium text-muted-foreground">
              {t('pendingForms')}
            </p>
            <p className="text-xl font-bold">{pendingForms}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('completedForms')}
              </p>
              <p className="text-lg font-bold">{completedForms}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('totalForms')}
              </p>
              <p className="text-lg font-bold">{totalForms}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SchoolStatsCard;
