
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { RegionStats } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext';

interface RegionsListProps {
  regions: RegionStats[];
  className?: string;
}

const RegionsList: React.FC<RegionsListProps> = ({ regions, className }) => {
  const { t } = useLanguage();
  
  // Sort regions by completion rate
  const sortedRegions = [...regions].sort((a, b) => 
    b.completionRate - a.completionRate
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t('regions')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {sortedRegions.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              {t('noRegions')}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sortedRegions.map((region) => (
                <div key={region.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{region.name}</div>
                    <div className="text-sm">{region.completionRate}%</div>
                  </div>
                  <div className="space-y-1">
                    <Progress value={region.completionRate} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{t('sectors')}: {region.sectorCount}</span>
                      <span>{t('schools')}: {region.schoolCount}</span>
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

export default RegionsList;
