
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { School } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { SchoolStat } from '@/types/dashboard';
import { useNavigate } from 'react-router-dom';

interface SchoolsListProps {
  schools: SchoolStat[];
}

const SchoolsList: React.FC<SchoolsListProps> = ({ schools }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const getStatusClass = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  // Listdəki məktəbəlri tamamlanma faizinə görə sıralayır
  const sortedSchools = [...schools].sort((a, b) => 
    (b.completionRate ?? b.completion?.percentage ?? 0) - 
    (a.completionRate ?? a.completion?.percentage ?? 0)
  );

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">
          {t('schools')}
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/schools')}
        >
          {t('viewAll')}
        </Button>
      </CardHeader>
      <CardContent>
        {sortedSchools.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            {t('noSchoolsFound')}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedSchools.map((school) => {
              const completionPercentage = school.completionRate ?? school.completion?.percentage ?? 0;
              
              return (
                <div key={school.id} className="grid grid-cols-12 gap-4 items-center p-2 hover:bg-secondary/20 rounded-md transition-colors">
                  <div className="col-span-7 lg:col-span-5 flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-md">
                      <School className="h-4 w-4 text-primary" />
                    </div>
                    <div className="truncate">
                      <p className="truncate font-medium text-sm">{school.name}</p>
                      {school.sector && (
                        <p className="text-xs text-muted-foreground">{school.sector}</p>
                      )}
                    </div>
                  </div>
                  <div className="col-span-3 lg:col-span-5">
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 rounded-full bg-primary" 
                        style={{ width: `${completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className={`text-sm font-medium ${getStatusClass(completionPercentage)}`}>
                      {completionPercentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SchoolsList;
