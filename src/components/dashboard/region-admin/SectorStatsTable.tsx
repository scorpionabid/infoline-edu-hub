
import React from 'react';
import { CardHeader, CardContent, CardTitle } from '@/components/ui/card';

interface SectorStat {
  id: string;
  name: string;
  completion?: number;
  schoolCount?: number;
}

interface SectorStatsTableProps {
  stats: SectorStat[];
}

const SectorStatsTable: React.FC<SectorStatsTableProps> = ({ stats }) => {
  return (
    <div>
      <CardHeader>
        <CardTitle>Sektor Statistikası</CardTitle>
      </CardHeader>
      <CardContent>
        {stats.length === 0 ? (
          <p className="text-center text-muted-foreground">Heç bir sektor məlumatı tapılmadı</p>
        ) : (
          <div className="space-y-4">
            {stats.map(sector => (
              <div key={sector.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{sector.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {sector.schoolCount || 0} məktəb
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{sector.completion || 0}%</p>
                  <p className="text-sm text-muted-foreground">tamamlanma</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </div>
  );
};

export default SectorStatsTable;
