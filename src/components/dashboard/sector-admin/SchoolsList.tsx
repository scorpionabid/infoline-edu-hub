
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { SchoolStat } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SchoolsListProps {
  schools: SchoolStat[];
  onViewSchool?: (schoolId: string) => void;
}

const SchoolsList: React.FC<SchoolsListProps> = ({ schools, onViewSchool }) => {
  const { t } = useLanguage();

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>{t('schools')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {schools.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              {t('noSchools')}
            </div>
          ) : (
            <div className="space-y-4">
              {schools.map((school) => (
                <div key={school.id} className="border rounded-md p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{school.name}</span>
                    {school.pendingCount > 0 && (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        {t('pendingCount', { count: school.pendingCount })}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{t('completion')}</span>
                      <span>{school.completionRate}%</span>
                    </div>
                    <Progress value={school.completionRate} className="h-2" />
                  </div>
                  
                  {onViewSchool && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full flex justify-between items-center"
                      onClick={() => onViewSchool(school.id)}
                    >
                      <span>{t('viewDetails')}</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SchoolsList;
