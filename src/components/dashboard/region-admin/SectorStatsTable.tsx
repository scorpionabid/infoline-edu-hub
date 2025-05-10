
import React from 'react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { SectorStat } from '@/types/dashboard';
import { Progress } from '@/components/ui/progress';
import { ArrowRight } from 'lucide-react';

interface SectorStatsTableProps {
  sectors: SectorStat[];
}

const SectorStatsTable: React.FC<SectorStatsTableProps> = ({ sectors }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('sector')}</TableHead>
            <TableHead>{t('schools')}</TableHead>
            <TableHead>{t('completion')}</TableHead>
            <TableHead className="text-right">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sectors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                {t('noSectors')}
              </TableCell>
            </TableRow>
          ) : (
            sectors.map((sector) => (
              <TableRow key={sector.id}>
                <TableCell className="font-medium">{sector.name}</TableCell>
                <TableCell>{sector.schoolCount || 0}</TableCell>
                <TableCell>
                  <div className="flex flex-col space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>{sector.completion || 0}%</span>
                    </div>
                    <Progress value={sector.completion || 0} className="h-1.5" />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate(`/sectors/${sector.id}`)}
                  >
                    {t('details')}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
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
