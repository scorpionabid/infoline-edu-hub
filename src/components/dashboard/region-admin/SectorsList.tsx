
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectorCompletionItem } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SectorsListProps {
  sectors: SectorCompletionItem[];
}

const SectorsList: React.FC<SectorsListProps> = ({ sectors }) => {
  const { t } = useLanguage();

  // Sektorları tamamlanma faizinə görə sıralayaq
  const sortedSectors = [...sectors].sort((a, b) => b.completionRate - a.completionRate);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('sectorsList')}</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedSectors.length === 0 ? (
          <div className="text-center text-muted-foreground p-4">
            {t('noSectors')}
          </div>
        ) : (
          <ScrollArea className="h-[350px]">
            <div className="space-y-4">
              {sortedSectors.map((sector) => (
                <div key={sector.id} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-medium">{sector.name}</h4>
                      <p className="text-xs text-muted-foreground">{sector.schoolCount} {t('schools')}</p>
                    </div>
                    <div className="text-sm font-medium">{sector.completionRate}%</div>
                  </div>
                  <Progress value={sector.completionRate} className="h-2" />
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default SectorsList;
