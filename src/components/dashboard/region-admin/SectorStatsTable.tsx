
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';

interface SectorStat {
  id: string;
  name: string;
  completionRate: number;
  schoolCount: number;
  pendingApprovals: number;
}

interface SectorStatsTableProps {
  sectorStats: SectorStat[];
}

const SectorStatsTable: React.FC<SectorStatsTableProps> = ({ sectorStats }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleRowClick = (sectorId: string) => {
    navigate(`/sectors/${sectorId}`);
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('sectorName')}</TableHead>
            <TableHead className="text-right">{t('completionRate')}</TableHead>
            <TableHead className="text-right">{t('schoolCount')}</TableHead>
            <TableHead className="text-right">{t('pendingApprovals')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sectorStats.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4">
                {t('noSectorsFound')}
              </TableCell>
            </TableRow>
          ) : (
            sectorStats.map((sector) => (
              <TableRow 
                key={sector.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleRowClick(sector.id)}
              >
                <TableCell className="font-medium">{sector.name}</TableCell>
                <TableCell className="text-right">
                  {Math.round(sector.completionRate)}%
                </TableCell>
                <TableCell className="text-right">
                  {sector.schoolCount}
                </TableCell>
                <TableCell className="text-right">
                  {sector.pendingApprovals}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SectorStatsTable;
