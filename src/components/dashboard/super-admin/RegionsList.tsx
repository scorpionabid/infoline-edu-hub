
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RegionStats } from '@/types/dashboard';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';

interface RegionsListProps {
  regions: RegionStats[];
}

export const RegionsList: React.FC<RegionsListProps> = ({ regions }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  if (!regions || regions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t('noRegionsFound')}
      </div>
    );
  }
  
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('regionName')}</TableHead>
            <TableHead>{t('schools')}</TableHead>
            <TableHead>{t('sectors')}</TableHead>
            <TableHead>{t('completionRate')}</TableHead>
            <TableHead>{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {regions.map((region) => (
            <TableRow key={region.id}>
              <TableCell className="font-medium">{region.name}</TableCell>
              <TableCell>{region.totalSchools || region.schoolCount || 0}</TableCell>
              <TableCell>{region.sectors || region.sectorCount || 0}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress value={region.completionRate} className="h-2 w-24" />
                  <span className="text-sm text-muted-foreground">
                    {region.completionRate}%
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate(`/regions/${region.id}`)}
                >
                  {t('details')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RegionsList;
