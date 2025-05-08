
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface RegionProps {
  id: string;
  name: string;
  status?: string;
  completionRate?: number;
  schoolCount?: number;
}

interface RegionCompletionCardProps {
  regions: RegionProps[];
}

const RegionCompletionCard: React.FC<RegionCompletionCardProps> = ({ regions }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  if (!regions || regions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('regions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center">{t('noRegions')}</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('regions')}</CardTitle>
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
              {regions.slice(0, 5).map((region) => (
                <TableRow key={region.id}>
                  <TableCell className="font-medium">{region.name}</TableCell>
                  <TableCell className="text-right">{region.schoolCount || 0}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Progress 
                        value={region.completionRate || 0} 
                        className="h-2 w-[100px]"
                        indicatorClassName={
                          (region.completionRate || 0) > 80 ? "bg-green-500" :
                          (region.completionRate || 0) > 50 ? "bg-blue-500" :
                          (region.completionRate || 0) > 30 ? "bg-yellow-500" : "bg-red-500"
                        }
                      />
                      <span className="w-8 text-sm">{Math.round(region.completionRate || 0)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate(`/regions/${region.id}`)}
                    >
                      {t('view')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {regions.length > 5 && (
          <div className="mt-2 flex justify-end">
            <Button variant="link" onClick={() => navigate('/regions')}>
              {t('viewAll')} ({regions.length})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RegionCompletionCard;
