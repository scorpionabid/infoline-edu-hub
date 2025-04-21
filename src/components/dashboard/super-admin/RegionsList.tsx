
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RegionStats } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Eye, Plus } from 'lucide-react';

interface RegionsListProps {
  regions: RegionStats[];
  className?: string;
}

const RegionsList: React.FC<RegionsListProps> = ({ regions, className }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('regions')}</CardTitle>
        <Button variant="outline" size="sm" onClick={() => navigate('/regions')}>
          <Plus className="h-4 w-4 mr-2" />
          {t('addRegion')}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {regions.length === 0 ? (
            <p className="text-muted-foreground">{t('noRegionsFound')}</p>
          ) : (
            <div className="grid gap-4">
              {regions.map((region) => (
                <div 
                  key={region.id} 
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-4 space-y-3 sm:space-y-0"
                >
                  <div className="space-y-1">
                    <h4 className="font-medium">{region.name}</h4>
                    <div className="text-sm text-muted-foreground flex flex-col sm:flex-row sm:gap-4">
                      <span>{t('sectors')}: {region.sectorCount}</span>
                      <span>{t('schools')}: {region.schoolCount}</span>
                      {region.adminEmail && (
                        <span>{t('admin')}: {region.adminEmail}</span>
                      )}
                    </div>
                    {region.completionRate !== undefined && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{t('completionRate')}</span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden w-32">
                            <div 
                              className={`h-full rounded-full ${
                                region.completionRate >= 75 ? 'bg-green-500' : 
                                region.completionRate >= 50 ? 'bg-amber-500' : 
                                'bg-red-500'
                              }`}
                              style={{ width: `${region.completionRate}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{region.completionRate}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate(`/regions/${region.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {t('view')}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RegionsList;
