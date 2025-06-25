
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/contexts/TranslationContext';

interface SectorStatsTableProps {
  sectors: any[];
}

const SectorStatsTable: React.FC<SectorStatsTableProps> = ({ sectors }) => {
  const { t } = useTranslation();

  if (!sectors || sectors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("sectorStats", "Sektor Statistikaları")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            {t("noSectorsFound", "Sektor tapılmadı")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("sectorStats", "Sektor Statistikaları")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sectors.map((sector, index) => (
            <div key={sector.id || index} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{sector.name || `Sektor ${index + 1}`}</h3>
                <Badge variant="outline">
                  {sector.completion_rate || 0}% {t("completed", "tamamlandı")}
                </Badge>
              </div>
              <Progress value={sector.completion_rate || 0} className="mb-2" />
              <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">{sector.total_schools || 0}</span>
                  <br />
                  {t("totalSchools", "Ümumi məktəblər")}
                </div>
                <div>
                  <span className="font-medium">{sector.completed_schools || 0}</span>
                  <br />
                  {t("completedSchools", "Tamamlanmış")}
                </div>
                <div>
                  <span className="font-medium">{sector.pending_schools || 0}</span>
                  <br />
                  {t("pendingSchools", "Gözləyən")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SectorStatsTable;
