
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/contexts/TranslationContext';

interface SchoolDataGridProps {
  category: any;
  column: any;
  schoolData: any[];
  stats: any;
  loading: boolean;
  saving: boolean;
  permissions: any;
  onDataChange: (schoolId: string, value: any) => void;
  onBulkChange: (changes: Record<string, any>) => void;
  onApprove: (schoolId: string) => void;
  onReject: (schoolId: string, reason: string) => void;
  onSave: () => void;
}

const SchoolDataGrid: React.FC<SchoolDataGridProps> = ({
  category,
  column,
  schoolData,
  stats,
  loading,
  saving,
  permissions,
  onDataChange,
  onBulkChange,
  onApprove,
  onReject,
  onSave
}) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">{t("loading", "Yüklənir...")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{category?.name} - {column?.name}</span>
          <Badge variant="outline">
            {schoolData.length} {t("schools", "məktəb")}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {schoolData.map((school) => (
            <div key={school.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{school.name}</h3>
                  <p className="text-sm text-muted-foreground">{school.sector_name}</p>
                </div>
                <Badge variant={school.status === 'approved' ? 'default' : 'secondary'}>
                  {t(school.status, school.status)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export { SchoolDataGrid };
