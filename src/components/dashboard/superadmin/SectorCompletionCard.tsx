
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface SectorProps {
  id: string;
  name: string;
  status?: string;
  completionRate?: number;
  schoolCount?: number;
  region_id?: string;
}

interface SectorCompletionCardProps {
  sectors: SectorProps[];
}

const SectorCompletionCard: React.FC<SectorCompletionCardProps> = ({ sectors }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  if (!sectors || sectors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('sectors')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center">{t('noSectors')}</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('sectors')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('name')}</TableHead>
                <TableHead className="w-[100px] text-right">{t('schools')}</TableHead>
                <TableHead className="w-[200px] text-right">{t('completion')}</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sectors.slice(0, 5).map((sector) => (
                <TableRow key={sector.id}>
                  <TableCell className="font-medium">{sector.name}</TableCell>
                  <TableCell className="text-right">{sector.schoolCount || 0}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Progress 
                        value={sector.completionRate || 0} 
                        className="h-2 w-[100px]"
                        indicatorClassName={
                          (sector.completionRate || 0) > 80 ? "bg-green-500" :
                          (sector.completionRate || 0) > 50 ? "bg-blue-500" :
                          (sector.completionRate || 0) > 30 ? "bg-yellow-500" : "bg-red-500"
                        }
                      />
                      <span className="w-8 text-sm">{Math.round(sector.completionRate || 0)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate(`/sectors/${sector.id}`)}
                    >
                      {t('view')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {sectors.length > 5 && (
          <div className="mt-2 flex justify-end">
            <Button variant="link" onClick={() => navigate('/sectors')}>
              {t('viewAll')} ({sectors.length})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SectorCompletionCard;
