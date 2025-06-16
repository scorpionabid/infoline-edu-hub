
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/context/LanguageContext';
import { SchoolStat } from '@/types/dashboard';
import { Eye, Edit, Trash2 } from 'lucide-react';

interface SchoolsTableProps {
  schools: SchoolStat[];
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const SchoolsTable: React.FC<SchoolsTableProps> = ({ 
  schools, 
  onView, 
  onEdit, 
  onDelete 
}) => {
  const { t } = useLanguage();

  if (!schools || schools.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('schools') || 'Məktəblər'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>{t('noSchoolsFound') || 'Məktəb tapılmadı'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('schools') || 'Məktəblər'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {schools.map((school) => (
            <div key={school.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium">{school.name}</h3>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="w-32">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{Math.round(school.completionRate)}%</span>
                    </div>
                    <Progress value={school.completionRate} className="h-2" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t('pending')}: {school.pendingForms || 0}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                {onView && (
                  <Button variant="ghost" size="sm" onClick={() => onView(school.id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                {onEdit && (
                  <Button variant="ghost" size="sm" onClick={() => onEdit(school.id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button variant="ghost" size="sm" onClick={() => onDelete(school.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SchoolsTable;
