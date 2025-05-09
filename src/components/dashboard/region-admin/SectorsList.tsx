
import React from 'react';
import { CardHeader, CardContent, CardTitle } from '@/components/ui/card';

interface SectorStat {
  id: string;
  name: string;
  completion?: number;
  schoolCount?: number;
}

interface SectorsListProps {
  sectors: SectorStat[];
}

const SectorsList: React.FC<SectorsListProps> = ({ sectors }) => {
  return (
    <div>
      <CardHeader>
        <CardTitle>Sektorlar</CardTitle>
      </CardHeader>
      <CardContent>
        {sectors.length === 0 ? (
          <p className="text-center text-muted-foreground">Heç bir sektor tapılmadı</p>
        ) : (
          <div className="space-y-2">
            {sectors.map(sector => (
              <div key={sector.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                <span>{sector.name}</span>
                <span className="text-sm font-medium">{sector.schoolCount || 0} məktəb</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </div>
  );
};

export default SectorsList;
