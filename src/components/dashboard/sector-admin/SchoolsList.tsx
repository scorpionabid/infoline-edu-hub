
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { SchoolStat } from '@/types/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { School } from 'lucide-react';

interface SchoolsListProps {
  schools: SchoolStat[];
}

const SchoolsList: React.FC<SchoolsListProps> = ({ schools }) => {
  const { t } = useLanguage();

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center">
          <School className="mr-2 h-5 w-5" />
          {t('schools')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {schools.map((school) => (
            <div key={school.id} className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="font-medium">{school.name}</p>
                <p className="text-sm text-muted-foreground">{t('pendingItems')}: {school.pending}</p>
              </div>
              <div>
                <span className="text-sm font-semibold">{school.completionRate}%</span>
                <div className="w-20 bg-gray-200 rounded-full h-2.5 mt-1">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${school.completionRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SchoolsList;
