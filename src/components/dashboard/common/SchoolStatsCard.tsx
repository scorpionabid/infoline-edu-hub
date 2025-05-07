
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { SchoolStat } from '@/types/dashboard';
import { formatPercentage } from '@/utils/formatters';

interface SchoolStatsCardProps {
  schoolStats: SchoolStat[];
  className?: string;
}

const SchoolStatsCard: React.FC<SchoolStatsCardProps> = ({ schoolStats, className }) => {
  const { t } = useLanguage();

  if (!schoolStats || schoolStats.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{t('schoolPerformance')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('noSchoolsData')}</p>
        </CardContent>
      </Card>
    );
  }

  // Məktəbləri tamamlanma faizinə görə sıralayaq
  const sortedSchools = [...schoolStats].sort((a, b) => (b.completionRate || 0) - (a.completionRate || 0));
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t('schoolPerformance')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedSchools.slice(0, 5).map((school) => (
            <div key={school.id} className="flex flex-col space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{school.name}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  (school.completionRate || 0) >= 75 ? 'bg-green-100 text-green-800' : 
                  (school.completionRate || 0) >= 50 ? 'bg-amber-100 text-amber-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {formatPercentage(school.completionRate)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className={`h-1.5 rounded-full ${
                  (school.completionRate || 0) >= 75 ? 'bg-green-500' : 
                  (school.completionRate || 0) >= 50 ? 'bg-amber-500' : 
                  'bg-red-500'
                }`} style={{ width: `${school.completionRate || 0}%` }}></div>
              </div>
              <div className="text-xs text-muted-foreground flex justify-between">
                <span>{school.formsCompleted || 0}/{school.totalForms || 0} {t('forms')}</span>
                <span>{school.principal || school.principalName || ''}</span>
              </div>
              <div className="h-px bg-muted my-1"></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SchoolStatsCard;
