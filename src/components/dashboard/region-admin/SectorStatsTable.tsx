
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { SectorStat } from '@/types/dashboard';

interface SectorStatsTableProps {
  sectors: SectorStat[];
}

const SectorStatsTable: React.FC<SectorStatsTableProps> = ({ sectors }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (!sectors || sectors.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <p>{t('noSectors')}</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('name')}</TableHead>
          <TableHead>{t('schools')}</TableHead>
          <TableHead className="text-right">{t('completion')}</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sectors.map((sector) => {
          const completionRate = sector.completionRate || sector.completion || 0;
          let statusColor = 'bg-gray-100 text-gray-700';
          
          if (completionRate >= 90) {
            statusColor = 'bg-green-100 text-green-700';
          } else if (completionRate >= 50) {
            statusColor = 'bg-blue-100 text-blue-700';
          } else if (completionRate > 0) {
            statusColor = 'bg-amber-100 text-amber-700';
          }
          
          return (
            <TableRow key={sector.id}>
              <TableCell className="font-medium">{sector.name}</TableCell>
              <TableCell>{sector.schoolCount || 0}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Progress value={completionRate} className="h-2 w-20" />
                  <Badge variant="outline" className={statusColor}>
                    {completionRate}%
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/sectors/${sector.id}`)}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default SectorStatsTable;
