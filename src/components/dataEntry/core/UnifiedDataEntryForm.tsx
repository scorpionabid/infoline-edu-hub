
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, Send } from 'lucide-react';
import { Column } from '@/types/column';
import FormFields from './FormFields';
import { toast } from 'sonner';

interface UnifiedDataEntryFormProps {
  categoryId: string;
  schoolId: string;
  columns: any[];
  initialData?: Record<string, any>;
  onSave?: (data: Record<string, any>) => Promise<void>;
  onSubmit?: (data: Record<string, any>) => Promise<void>;
  readOnly?: boolean;
}

const UnifiedDataEntryForm: React.FC<UnifiedDataEntryFormProps> = ({
  categoryId,
  schoolId,
  columns,
  initialData = {},
  onSave,
  onSubmit,
  readOnly = false
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleSave = async () => {
    if (!onSave || isSaving) return;

    try {
      setIsSaving(true);
      await onSave(formData);
      toast.success('Məlumatlar yadda saxlanıldı');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Yadda saxlama xətası');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!onSubmit || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      toast.success('Məlumatlar təsdiq üçün göndərildi');
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Göndərmə xətası');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Fields */}
      <Card>
        <CardContent className="pt-6">
          <FormFields
            columns={columns}
            readOnly={readOnly}
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {!readOnly && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-end gap-3">
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
                disabled={isSubmitting}
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Göndərilir...' : 'Təsdiq üçün göndər'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UnifiedDataEntryForm;
