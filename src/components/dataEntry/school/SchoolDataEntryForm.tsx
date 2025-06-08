
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { Column } from '@/types/column';
import { useDataEntry } from '@/hooks/business/dataEntry/useDataEntry';
import FormFields from '../core/FormFields';
import { toast } from 'sonner';

interface SchoolDataEntryFormProps {
  categoryId: string;
  schoolId: string;
  columns: Column[];
  onComplete?: () => void;
}

const SchoolDataEntryForm: React.FC<SchoolDataEntryFormProps> = ({
  categoryId,
  schoolId,
  columns,
  onComplete
}) => {
  const {
    entries,
    isLoading,
    isSaving,
    isSubmitting,
    completionPercentage,
    hasAllRequiredData,
    updateEntryValue,
    saveAll,
    submitAll,
    getValueForColumn
  } = useDataEntry({ 
    categoryId, 
    schoolId, 
    onComplete 
  });

  // Convert entries to form data format
  const formData = React.useMemo(() => {
    const data: Record<string, any> = {};
    columns.forEach(column => {
      data[column.id] = getValueForColumn(column);
    });
    return data;
  }, [columns, getValueForColumn]);

  const handleFieldChange = (columnId: string, value: any) => {
    updateEntryValue(columnId, value);
  };

  const handleSave = async () => {
    try {
      await saveAll();
      toast.success('Məktəb məlumatları yadda saxlanıldı');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Yadda saxlama xətası');
    }
  };

  const handleSubmit = async () => {
    if (!hasAllRequiredData) {
      toast.error('Bütün tələb olunan sahələri doldurun');
      return;
    }

    try {
      await submitAll();
      toast.success('Məktəb məlumatları təsdiq üçün göndərildi');
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Göndərmə xətası');
    }
  };

  const hasUnsavedChanges = entries.some(entry => entry.status === 'draft');

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Məktəb Məlumat Forması
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={completionPercentage === 100 ? "default" : "secondary"}>
                {completionPercentage}% tamamlandı
              </Badge>
              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-orange-600">
                  Yadda saxlanmamış dəyişikliklər
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Form Fields */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <FormFields
              columns={columns}
              formData={formData}
              onChange={handleFieldChange}
              readOnly={false}
            />
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {hasAllRequiredData ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Form keçərlidir</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-orange-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Bəzi sahələr doldurulmayıb</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saxlanılır...' : 'Saxla'}
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !hasAllRequiredData}
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Göndərilir...' : 'Təsdiq üçün göndər'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolDataEntryForm;
