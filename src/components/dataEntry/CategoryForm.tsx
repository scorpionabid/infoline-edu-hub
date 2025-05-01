import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLanguage } from '@/context/LanguageContext';
import { CategoryWithColumns } from '@/types/column';
import { EntryValue } from '@/types/dataEntry';

interface CategoryFormProps {
  category: CategoryWithColumns;
  onSave: () => void;
  onSubmit: () => void;
  onExcelImport?: (data: Record<string, any>) => void;
  onExcelExport?: () => void;
  index: number;
  currentIndex: number;
  onChangeCategory: (index: number) => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onSave,
  onSubmit,
  onExcelImport,
  onExcelExport,
  index,
  currentIndex,
  onChangeCategory,
}) => {
  const { t } = useLanguage();
  const [showExport, setShowExport] = useState(false);
  
  // Tamamlanma faizini hesablayırıq əgər mövcud deyilsə
  const completionPercentage = category.completionPercentage || 0;
  
  // Aktiv kateqoriya olub-olmadığını yoxlayırıq
  const isActive = index === currentIndex;
  
  if (!isActive) {
    return (
      <Card 
        className={`mb-4 cursor-pointer hover:border-primary transition-all ${
          completionPercentage === 100 ? 'border-green-500' : 
          completionPercentage > 0 ? 'border-amber-500' : 'border-gray-300'
        }`}
        onClick={() => onChangeCategory(index)}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-md font-medium">{category.name}</CardTitle>
            <div className="text-xs font-medium bg-slate-100 px-2 py-1 rounded-full">
              {completionPercentage}%
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${
                completionPercentage === 100 ? 'bg-green-500' : 
                completionPercentage > 50 ? 'bg-amber-500' : 'bg-rose-500'
              }`} 
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Bu hissədə status tipləri arasında uyğunluq yaratmaq üçün tip çevirmələri edək
  // Artıq kateqoriya statusu ilə data entry statusu arasında fərq var
  const displayStatus = () => {
    // Statusu string olaraq alırıq
    const status = (category as any).status;

    if (status === "approved" || status === "pending" || status === "rejected") {
      return status; // Data entry statusudur
    }
    
    // Əgər entries varsa və bütün entries statusu eynidir
    if (category.entries && category.entries.length > 0) {
      const entryStatuses = category.entries.map(e => e.status);
      if (entryStatuses.every(s => s === "approved")) return "approved";
      if (entryStatuses.every(s => s === "pending")) return "pending";
      if (entryStatuses.every(s => s === "rejected")) return "rejected";
    }
    
    // Default hal
    return "draft";
  };
  
  const cardStatus = displayStatus();

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">{category.name}</CardTitle>
          {cardStatus === "approved" && (
            <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
              {t('approved')}
            </div>
          )}
          {cardStatus === "pending" && (
            <div className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full font-medium">
              {t('pending')}
            </div>
          )}
          {cardStatus === "rejected" && (
            <div className="bg-rose-100 text-rose-700 text-xs px-2 py-1 rounded-full font-medium">
              {t('rejected')}
            </div>
          )}
        </div>
        {category.description && (
          <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
        )}
      </CardHeader>
      
      <CardContent>
        {category.columns.length === 0 ? (
          <Alert>
            <AlertTitle>{t('noColumns')}</AlertTitle>
            <AlertDescription>
              {t('noColumnsDesc')}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-4">
            {category.columns.map((column) => (
              <div key={column.id}>
                {/* <Input
                  type="text"
                  placeholder={column.placeholder || column.name}
                /> */}
                <p>{column.name}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-4 flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onSave}>
            {t('saveAsDraft')}
          </Button>
          <Button size="sm" onClick={onSubmit}>
            {t('submitForApproval')}
          </Button>
        </div>
        
        <div className="flex gap-2">
          {onExcelImport && (
            <Button variant="outline" size="sm" onClick={() => setShowExport(!showExport)}>
              {t('importExcel')}
            </Button>
          )}
          {onExcelExport && (
            <Button variant="outline" size="sm" onClick={onExcelExport}>
              {t('exportExcel')}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default CategoryForm;
