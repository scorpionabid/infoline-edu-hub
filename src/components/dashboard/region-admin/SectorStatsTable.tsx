
import React from 'react';
import { CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { SectorStat } from '@/types/dashboard';

interface SectorStatsTableProps {
  stats: SectorStat[];
}

const SectorStatsTable: React.FC<SectorStatsTableProps> = ({ stats }) => {
  return (
    <div>
      <CardHeader>
        <CardTitle>Sektor statistikası</CardTitle>
      </CardHeader>
      <CardContent>
        {stats.length === 0 ? (
          <p className="text-center text-muted-foreground">Sektor məlumatı tapılmadı</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sektor</TableHead>
                  <TableHead className="text-right">Məktəb sayı</TableHead>
                  <TableHead className="text-right">Tamamlanma</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.map((sector) => (
                  <TableRow key={sector.id}>
                    <TableCell>{sector.name}</TableCell>
                    <TableCell className="text-right">{sector.schoolCount || 0}</TableCell>
                    <TableCell className="text-right">{sector.completion ? `${Math.round(sector.completion)}%` : '0%'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </div>
  );
};

export default SectorStatsTable;
