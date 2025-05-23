import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTestDataEntry } from '@/hooks/business/dataEntry/useTestDataEntry';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

/**
 * Test komponenti - Yeni hook strukturunu sınaqdan keçirmək üçün
 * Bu komponent useDataEntryExample hook-undan istifadə edir və yeni hook strukturunun
 * necə işlədiyini göstərir
 */
interface DataEntryFormExampleProps {
  categoryId: string;
  schoolId: string;
}

const DataEntryFormExample: React.FC<DataEntryFormExampleProps> = ({
  categoryId,
  schoolId
}) => {
  const { t } = useLanguage();
  
  // Yeni React Query əsaslı hook-dan istifadə edirik
  const {
    entries,
    columns,
    isLoading,
    isSaving,
    updateEntry,
    completionPercentage,
    getEntryByColumnId
  } = useTestDataEntry({
    categoryId,
    schoolId
  });
  
  // Komponent yükləndikdə məlumatlar avtomatik əldə edilir
  // React Query istifadə etdiyimiz üçün fetchData-ya ehtiyac yoxdur
  
  // Yüklənmə vəziyyətini göstəririk
  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('loading')}</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>
          Data Entry Example ({columns.length} columns)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-muted-foreground">
            Tamamlanma faizi: {completionPercentage}%
          </p>
          <div className="w-full bg-secondary h-2 mt-2 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full" 
              style={{ width: `${completionPercentage}%` }} 
            />
          </div>
        </div>
        
        {/* Sütunları və müvafiq dataları göstəririk */}
        <div className="space-y-4 mt-6">
          {columns.map(column => {
            // Müvafiq entry-ni tapırıq - indekslənmə funksiyamızı istifadə edirik
            const entry = getEntryByColumnId(column.id);
            
            return (
              <div key={column.id} className="border p-4 rounded-md">
                <h3 className="font-medium mb-2">{column.name}</h3>
                <div className="flex space-x-2 items-center">
                  <input
                    type="text"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={entry?.value || ''}
                    onChange={(e) => updateEntry(column.id, e.target.value)}
                    placeholder={column.placeholder || t('enterValue')}
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => updateEntry(column.id, '')}
                  >
                    {t('clear')}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Heç bir sütun yoxdursa */}
        {columns.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {t('noColumnsFound')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataEntryFormExample;
