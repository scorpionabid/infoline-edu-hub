
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SchoolStat } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SchoolsListProps {
  schools: SchoolStat[];
  className?: string;
}

const SchoolsList: React.FC<SchoolsListProps> = ({ schools, className }) => {
  const { t } = useLanguage();

  return (
    <Card className={className}>
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
                <div key={school.id} className="border rounded-md p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{school.name}</h3>
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                      {t('pending')}: {school.pendingCount}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{t('completion')}</span>
                      <span>{school.completionRate}%</span>
                    </div>
                    <Progress value={school.completionRate} className="h-2" />
                  </div>
                  
                  <Link to={`/schools/${school.id}`}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                    >
                      {t('viewSchool')}
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </Button>
                  </Link>
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
