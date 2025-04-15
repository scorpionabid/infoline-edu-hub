
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RegionStat } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RegionsListProps {
  regions: RegionStat[];
  className?: string;
}

const RegionsList: React.FC<RegionsListProps> = ({ regions, className }) => {
  const { t } = useLanguage();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t('regions')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {regions.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              {t('noRegions')}
            </div>
          ) : (
            <div className="space-y-4">
              {regions.map((region) => (
                <div key={region.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{region.name}</div>
                    <span className="text-sm">
                      {region.completionRate}%
                    </span>
                  </div>
                  <Progress value={region.completionRate} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{t('schoolCount', { count: region.schoolCount })}</span>
                    <span>{t('sectorCount', { count: region.sectorCount })}</span>
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
