
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertTriangle, Save, Send } from 'lucide-react';
import FormField from './fields/FormField';

export interface UnifiedDataEntryFormProps {
  entityType: 'school' | 'sector';
  entityId: string;
  categoryId: string;
  onSubmit?: () => void;
}

const UnifiedDataEntryForm: React.FC<UnifiedDataEntryFormProps> = ({
  entityType,
  entityId,
  categoryId,
  onSubmit
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [completion, setCompletion] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Məlumat Girişi
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
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Məlumatlar uğurla yadda saxlanıldı!
            </AlertDescription>
          </Alert>
        )}

        {isSubmitted && (
          <Alert>
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

export { UnifiedDataEntryForm };
export default UnifiedDataEntryForm;
