
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { RegionStats, SectorCompletionItem } from '@/types/dashboard';
import { useNavigate } from 'react-router-dom';

interface RegionListProps {
  regions: (RegionStats | SectorCompletionItem)[];
}

const RegionList: React.FC<RegionListProps> = ({ regions }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (regions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('regions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>{t('noRegions')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check if the array contains sector items
  const isSectorList = 'schoolCount' in regions[0] && !('sectorCount' in regions[0]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isSectorList ? t('sectors') : t('regions')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {regions.map((item) => {
            const completionRate = item.completionRate ?? 0;
            
            return (
              <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg">
                <div className="space-y-2 mb-3 sm:mb-0 flex-1">
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                    <h4 className="font-medium">{item.name}</h4>
                  </div>
                  <div className="flex-1">
                    <Progress value={completionRate} className="h-2" />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-muted-foreground">
                        {completionRate}% {t('completed')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    {'schoolCount' in item && (
                      <span className="text-muted-foreground">
                        {item.schoolCount} {t('schools')}
                      </span>
                    )}
                    {'sectorCount' in item && (
                      <span className="text-muted-foreground">
                        {item.sectorCount} {t('sectors')}
                      </span>
                    )}
                    {'status' in item && (
                      <Badge 
                        variant="outline"
                        className={
                          item.status === 'active' 
                            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                            : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800"
                        }
                      >
                        {item.status}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(isSectorList ? `/sectors/${item.id}` : `/regions/${item.id}`)}
                  className="sm:ml-4"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t('viewDetails')}
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RegionList;
