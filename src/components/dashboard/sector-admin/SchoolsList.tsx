
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SchoolStat } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext';

interface SchoolsListProps {
  schools: SchoolStat[];
}

const SchoolsList: React.FC<SchoolsListProps> = ({ schools }) => {
  const { t } = useLanguage();
  
  // Sort schools by completion percentage
  const sortedSchools = [...schools].sort((a, b) => 
    b.completionPercentage - a.completionPercentage
  );

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>{t('schools')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {sortedSchools.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              {t('noSchools')}
            </div>
          ) : (
            <div className="space-y-6">
              {sortedSchools.map((school) => (
                <div key={school.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{school.name}</div>
                    <div className="text-sm">{school.completionPercentage}%</div>
                  </div>
                  <div className="space-y-1">
                    <Progress value={school.completionPercentage} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{t('pendingItems')}: {school.pendingCount}</span>
                    </div>
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
