
import React from 'react';
import { SectorCompletion } from '@/types/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { Progress } from '@/components/ui/progress';

interface SectorsListProps {
  sectors: SectorCompletion[];
}

const SectorsList: React.FC<SectorsListProps> = ({ sectors }) => {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('sectorStatistics')}</CardTitle>
      </CardHeader>
      <CardContent>
        {sectors && sectors.length > 0 ? (
          <div className="space-y-4">
            {sectors.map((sector) => (
              <div key={sector.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{sector.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {sector.schoolCount} {t('schools')}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={sector.completionRate} className="h-2" />
                  <span className="text-sm font-medium w-9">{sector.completionRate}%</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">{t('noSectors')}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default SectorsList;
