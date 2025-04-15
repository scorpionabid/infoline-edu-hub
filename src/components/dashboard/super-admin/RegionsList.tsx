
import React from 'react';
import { RegionStat } from '@/types/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { MapPin } from 'lucide-react';

interface RegionsListProps {
  regions: RegionStat[];
}

const RegionsList: React.FC<RegionsListProps> = ({ regions }) => {
  const { t } = useLanguage();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="mr-2 h-5 w-5" />
          {t('regions')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {regions.map((region) => (
            <div key={region.id} className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="font-medium">{region.name}</p>
                <p className="text-sm text-muted-foreground">
                  {t('sectors')}: {region.sectorCount}, {t('schools')}: {region.schoolCount}
                </p>
              </div>
              <div>
                <span className="text-sm font-semibold">{region.completionRate}%</span>
                <div className="w-20 bg-gray-200 rounded-full h-2.5 mt-1">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${region.completionRate}%` }}
                  ></div>
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
