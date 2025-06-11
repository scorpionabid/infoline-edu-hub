import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertTriangle, Save, Send } from 'lucide-react';
import FormField from './fields/FormField';

interface EnhancedDataEntryFormProps {
  categoryId: string;
  entityId: string;
  entityType: 'school' | 'sector';
  onSubmit?: () => void;
}

interface CategoryData {
  categoryId: number;
  categoryName: string;
  data: Record<string, any>;
}

const EnhancedDataEntryForm: React.FC<EnhancedDataEntryFormProps> = ({
  categoryId,
  entityId,
  entityType,
  onSubmit
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [completion, setCompletion] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [categoryData, setCategoryData] = useState<CategoryData | null>(null);

  useEffect(() => {
    // Mock data loading
    setTimeout(() => {
      setCategoryData({
        categoryId: 1,
        categoryName: 'Infrastruktur',
        data: {
          'field1': 'value1',
          'field2': 'value2'
        }
      });
      setCompletion(75);
    }, 500);
  }, [categoryId, entityId, entityType]);

  const handleChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }, 1000);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      onSubmit?.();
      setTimeout(() => setIsSubmitted(false), 2000);
    }, 1500);
  };

  if (!categoryData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Clock className="mr-2 h-4 w-4 animate-spin" />
          Yüklənir...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {categoryData.categoryName} Məlumatları
          <Badge variant="outline">
            {entityType === 'school' ? 'Məktəb səviyyəsində' : 'Sektor səviyyəsində'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Bu forma {entityType} üçün məlumatları daxil etmək üçündür.
          </AlertDescription>
        </Alert>

        <Progress value={completion} />
        <p className="text-sm text-muted-foreground">
          Tamamlanma: {completion}%
        </p>

        <div className="space-y-4">
          {Object.entries(categoryData.data).map(([field, value]) => (
            <FormField
              key={field}
              label={field}
              value={value}
              onChange={(newValue) => handleChange(field, newValue)}
            />
          ))}
        </div>

        <div className="flex justify-between">
          <Button
            variant="secondary"
            onClick={handleSave}
            disabled={isSubmitting}
          >
            {isSaving ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Saxlanılır...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Yadda saxla
              </>
            )}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
          >
            {isSubmitting ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Göndərilir...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Göndər
              </>
            )}
          </Button>
        </div>

        {isSaved && (
          <Alert variant="success">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Məlumatlar uğurla yadda saxlanıldı!
            </AlertDescription>
          </Alert>
        )}

        {isSubmitted && (
          <Alert variant="success">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Məlumatlar uğurla göndərildi!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedDataEntryForm;
