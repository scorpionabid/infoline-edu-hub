
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { SectorCompletionItem } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext';

interface SectorsListProps {
  sectors: SectorCompletionItem[];
}

const SectorsList: React.FC<SectorsListProps> = ({ sectors }) => {
  const { t } = useLanguage();
  
  // Sort sectors by completion rate
  const sortedSectors = [...sectors].sort((a, b) => 
    (b.completionRate || b.completionPercentage || 0) - (a.completionRate || a.completionPercentage || 0)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('sectors')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {sortedSectors.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              {t('noSectors')}
            </div>
          ) : (
            <div className="space-y-6">
              {sortedSectors.map((sector) => (
                <div key={sector.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{sector.name}</div>
                    <div className="text-sm">{sector.completionRate || sector.completionPercentage || 0}%</div>
                  </div>
                  <div className="space-y-1">
                    <Progress 
                      value={sector.completionRate || sector.completionPercentage || 0} 
                      className="h-2" 
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{t('schools')}: {sector.schoolCount}</span>
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

export default SectorsList;
