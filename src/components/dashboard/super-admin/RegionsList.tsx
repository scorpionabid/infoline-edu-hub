
import React from 'react';
import { RegionStat } from '@/types/dashboard';
import { ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface RegionsListProps {
  regions: RegionStat[];
}

const RegionsList: React.FC<RegionsListProps> = ({ regions }) => {
  const { t } = useLanguage();
  
  if (!regions || regions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('regions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('noRegionsFound')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('regions')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {regions.map((region) => (
            <div key={region.id} className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{region.name}</p>
                <p className="text-sm text-muted-foreground">
                  {t('sectorsCount')}: {region.sectorCount}, {t('schoolsCount')}: {region.schoolCount}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">
                    {region.completionRate}%
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RegionsList;
