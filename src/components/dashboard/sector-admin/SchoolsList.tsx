
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SchoolStat } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SchoolsListProps {
  schools: SchoolStat[];
}

const SchoolsList: React.FC<SchoolsListProps> = ({ schools }) => {
  const { t } = useLanguage();

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>{t('schools')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {schools.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              {t('noSchools')}
            </div>
          ) : (
            <div className="space-y-4">
              {schools.map((school) => (
                <div key={school.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{school.name}</div>
                    <span className="text-sm">
                      {school.completionRate}%
                    </span>
                  </div>
                  <Progress value={school.completionRate} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{t('completionRate')}</span>
                    <span>{t('pendingItems', { count: school.pendingCount || 0 })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SchoolsList;
